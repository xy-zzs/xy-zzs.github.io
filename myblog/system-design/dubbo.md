# Dubbo导航栏

## 为什么使用Duboo

- 基于 HTTP/2 的 [Triple 协议](https://cn.dubbo.apache.org/zh/docs3-v2/java-sdk/concepts-and-architecture/triple/)以及面向代理 API 的编程体验。
- 强大的[流量治理能力](https://cn.dubbo.apache.org/zh/overview/tasks/traffic-management)，如地址发现、负载均衡、路由选址、动态配置等。
- [多语言 SDK 实现](https://cn.dubbo.apache.org/zh/overview/mannual/)，涵盖 Java、Golang、Javascript 等，更多语言实现将会陆续发布。
- 灵活的适配与扩展能力，可轻松与微服务体系其他组件如 Tracing、Transaction 等适配。
- [Dubbo Mesh 解决方案](https://cn.dubbo.apache.org/zh/docs3-v2/java-sdk/concepts-and-architecture/mesh/)，同时支持 Sidecar、Proxyless 等灵活的 Mesh 部署方案。

Dubbo 在解决业务落地与规模化实践方面有着无可比拟的优势：

- 开箱即用
- 面向大规模微服务集群设计
- 高度可扩展



## 服务暴露

1. 解析xml文件、注解等文件，把provider、register、monitor、protocols、application、module等信息保存下来；

2. 对信息进行一些前置的配置检查

3. 组装`URL`，将版本、时间戳、方法名以及各种配置对象的字段信息放入到 map 中，map 中的内容将作为 URL 的查询字符串。构建好 map 后，紧接着是获取上下文路径、主机名以及端口号等信息。最后将 map 和主机名等数据传给 URL 构造方法创建 URL 对象。

4. 到处 Dubbo 服务：服务导出分为导出到本地 (JVM)，和导出到远程。

   根据 url 中的 scope 参数决定服务导出方式，分别如下：

   - scope = none，不导出服务
   - scope != remote，导出到本地
   - scope != local，导出到远程

   不管是导出到本地，还是远程。进行服务导出之前，均需要先创建 Invoker，这是一个很重要的步骤。

5. 在 Dubbo 中，Invoker 是一个非常重要的模型。在服务提供端，以及服务引用端均会出现 Invoker。Dubbo 官方文档中对 Invoker 进行了说明，这里引用一下。

   >  Invoker 是实体域，它是 Dubbo 的核心模型，其它模型都向它靠扰，或转换成它，它代表一个可执行体，可向它发起 invoke 调用，它有可能是一个本地的实现，也可能是一个远程的实现，也可能一个集群实现。

   Invoker 是由 ProxyFactory 创建而来，Dubbo 默认的 ProxyFactory 实现类是 JavassistProxyFactory。

6. 导出服务到本地

7. 导出服务到远程

   核心调用链路：`DubboProtocol. export() >> openServer(URL url) >> openServer() >>  createServer(URL url) >> HeaderExchangeServer.bind >> new NettyServer`

8. 服务注册

   - 获取注册中心实例—— ZookeeperTransporter.connect() 方法调用，用于创建Zookeeper 客户端
   - 向注册中心注册服——ZookeeperRegistry 在 doRegister 中调用了 Zookeeper 客户端创建服务节点，节点路径由 `toUrlPath()`生成

9. 订阅 override 节点

## 服务引用

<mark>原理</mark>

在进行具体工作之前，需先进行配置检查与收集工作。接着根据收集到的信息决定服务用的方式，有三种，第一种是引用本地 (JVM) 服务，第二是通过直连方式引用远程服务，第三是通过注册中心引用远程服务。不管是哪种引用方式，最后都会得到一个 Invoker 实例。如果有多个注册中心，多个服务提供者，这个时候会得到一组 Invoker 实例，此时需要通过集群管理类 Cluster 将多个 Invoker 合并成一个实例。合并后的 Invoker 实例已经具备调用本地或远程服务的能力了，但并不能将此实例暴露给用户使用，这会对用户业务代码造成侵入。此时框架还需要通过代理工厂类 (ProxyFactory) 为服务接口生成代理类，并让代理类去调用 Invoker 逻辑。避免了 Dubbo 框架代码对业务代码的侵入，同时也让框架更容易使用。

1. 处理配置：解析消费者配置
2. 创建引用
   - 创建Invoker
   - 创建代理类

## 服务调用

:question:客户端调用时做了什么？

1. Filter—可以做mock（本地伪装）、cache（结果缓存）等功能
2. 负载均衡—加权随机、权重轮询，一致性hash、最小活跃数
3. 重试



## 分层架构

Dubbo 整体架构分为10层，从宏观上把握这10层架构，并了解各层的功能和扩展点，可以帮助我们更好的了解 Dubbo。

![image-20230206230706899](http://images.xyzzs.top/image/image-20230206230706899.png_char)

其中，Service 和 Config 层为 API，其它各层均为 SPI。

### 代理层—Proxy

Proxy 层的功能就是使用**动态代理**的方式为接口创建代理类，Proxy 层最主要的接口就是 ProxyFactory。其默认的扩展点有：stub、jdk、javassist。**jdk 使用反射的方式创建代理类，javassist 通过拼接字符串然后编译的方式创建代理类**。

- 对于服务提供者，代理的对象是接口的真实实现。
- 对于服务消费者，代理的对象是远程服务的 invoker 对象。

### 注册层—Registry

注册层主要负责的就是服务的注册发现。这层的主要接口就是 RegistryFactory，其接口方法有 @Adaptive 注解，会根据参数 protocol 来选择实现，默认的扩展实现有：

- zookeeper
- redis
- multicast(广播模式)
- 内存

### 路由层—Cluster

集群层主要是对多提供者调用场景的抽象，是 Dubbo 整个集群容错的抽象层。主要的扩展点有：容错(Cluster)、路由(RouterFactory)、负载均衡(LoadBalance)。这层的这些扩展点参考之前的博客。

#### 容错

| 机制名            | 简介                                                         |
| ----------------- | ------------------------------------------------------------ |
| Failover **默认** | 失败重试。默认失败后在重试1次，重试**其他服务器**。通常使用在读/幂等写的场景。会对下游服务造成较大压力。 |
| Failfast          | 快速失败。失败就返回异常。使用在非幂等写的场景。但受网络影响大。 |
| Failsafe          | 失败不做处理，直接忽略异常。使用在不关心调用结果，且成功与否不重要的场景。 |
| Failback          | 失败后放入队列，并定时重试。使用在要保持最终一致或异步处理的场景。 |
| Forking           | 并行调用多个服务，只要一个成功就可以。使用在实时性要求高的场景，但会造成消费者资源浪费。 |
| Broadcast         | 广播给所有提供者，有一个失败就失败。                         |
| Mock              | 出现异常就会使用默认的返回内容，使用在服务降级的场景。       |
| Available         | 不用负载均衡，找到第一个可用提供者就调用。                   |
| Mergeable         | 把多个节点的返回结果合并。                                   |

#### 路由

- 条件路由；
- 文件路由；
- 脚本路由。

#### 负载均衡

- 权重随机负载均衡(**默认**)；
- 权重轮询负载均衡；
- 一致性 hash 负载均衡；
- 最小活跃数负载均衡。



### 监控层—Monitor

RPC 调用次数和调用时间监控，以 `Statistics` 为中心，扩展接口为 `MonitorFactory`, `Monitor`, `MonitorService`

### 协议层—Protocol

<font color=orchid>协议层是 Dubbo RPC 的核心，在这一层发起服务暴露(protocol.export)和服务引用(protocol.refer)。</font>

Dubbo 提供的协议有：

- Dubbo (默认)；
- injvm；
- rmi；
- http；
- hessian；
- thrift。

### 信息交换层—Exchange

信息交换层的作用就是封装 Request/Response 对象。

### 传输层—Transport

数据传输就是在传输层发生的，所以这层包含  Transport(传输)、Dispatcher(分派)、Codec2(编解码)、ThreadPool(线程池)，这几个接口。这也很好理解，数据传输发生在传输层，所以传输层一定需要具备数据传输的能力，也就是 Transport 和 Codec2，其中 Transport 就是 Netty  等网络传输的接口，编解码不必说了，传输肯定需要；除了传输能力，数据接收之后的处理，Dispatcher 和  ThreadPool，也就是分派任务和任务提交给线程池处理，也是必不可少的。

#### Transport

- Netty;
- Mina;
- Grizzly。

#### Dispatcher

| 策略       | 用途                                                         |
| ---------- | ------------------------------------------------------------ |
| all        | 所有消息都派发到线程池，包括请求，响应，连接事件，断开事件等，**默认** |
| direct     | 所有消息都不派发到线程池，全部在 IO 线程上直接执行           |
| message    | 只有**请求**和**响应**消息派发到线程池，其它消息均在 IO 线程上执行 |
| execution  | 只有**请求**消息派发到线程池，不含响应。其它消息均在 IO 线程上执行 |
| connection | 在 IO 线程上，将连接断开事件放入队列，有序逐个执行，其它消息派发到线程池 |

#### ThreadPool

| 线程池类型 | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| fixed      | 固定大小线程池，默认线程数200，启动时建立，不会关闭，一直存在 |
| cached     | 缓存线程池，空闲一分钟自动删除，需要时重建                   |
| limited    | 可伸缩线程池，但只会扩大不会缩小。这么做的目的是避免收缩的时候来大流量带来性能问题 |
| eager      | 优先创建 worker 线程池。任务数大于 corePoolSize 小于 maxPoolSize，创建 worker 处理，线程数大于 maxPoolSize ，任务放入阻塞队列，阻塞队列满了走拒绝策略。 |

### 序列化层—Serialize

序列化的作用是把对象转化为二进制流，然后在网络中传输。Dubbo 提供的序列化方式有：

- Hessian2(默认);
- Fastjson;
- fst;
- Java;
- Kayo;
- protobuff。

## Dubbo 的 SPI 机制

Dubbo 通过 SPI 机制提供了非常灵活的可扩展性。

<font color=orchid>可扩展性的优点</font>主要表现模块之间解耦，它符合开闭原则，对扩展开放，对修改关闭。当系统增加新功能时，不需要对现有系统的结构和代码进行修改，仅仅新增一个扩展即可。

<mark>Dubbo 中的可扩展性</mark>

- 平等对待第三方的实现。在 Dubbo 中，所有内部实现和第三方实现都是平等的，用户可以基于自身业务需求，替换 Dubbo 提供的原生实现。
- 每个扩展点只封装一个变化因子，最大化复用。每个扩展点的实现者，往往都只是关心一件事。如果用户有需求需要进行扩展，那么只需要对其关注的扩展点进行扩展就好，极大的减少用户的工作量。

<mark>Dubbo 扩展的特性</mark>

Dubbo 中的扩展能力是从 JDK 标准的 SPI 扩展点发现机制加强而来，它改进了 JDK 标准的 SPI 以下问题：

- JDK 标准的 SPI 会一次性实例化扩展点所有实现，如果有扩展实现初始化很耗时，但如果没用上也加载，会很浪费资源。
- 如果扩展点加载失败，连扩展点的名称都拿不到了。

用户能够基于 Dubbo 提供的扩展能力，很方便基于自身需求扩展其他协议、过滤器、路由等。下面介绍下 Dubbo 扩展能力的特性。

- 按需加载。Dubbo 的扩展能力不会一次性实例化所有实现，而是用扩展类实例化，减少资源浪费。
- 增加扩展类的 IOC 能力。Dubbo 的扩展能力并不仅仅只是发现扩展服务实现类，而是在此基础上更进一步，如果该扩展类的属性依赖其他对象，则 Dubbo 会自动的完成该依赖对象的注入功能。
- 增加扩展类的 AOP 能力。Dubbo 扩展能力会自动的发现扩展类的包装类，完成包装类的构造，增强扩展类的功能。
- 具备动态选择扩展实现的能力。Dubbo 扩展会基于参数，在运行时动态选择对应的扩展类，提高了 Dubbo 的扩展能力。
- 可以对扩展实现进行排序。能够基于用户需求，指定扩展实现的执行顺序。
- 提供扩展点的 Adaptive 能力。该能力可以使的一些扩展类在 consumer 端生效，一些扩展类在 provider 端生效。

Dubbo 中的 SPI 扩展点有很多，具体实现可参考[官网](https://cn.dubbo.apache.org/zh/docs3-v2/java-sdk/reference-manual/spi/description/)，有详细的实现方式说明

![image-20230207092558152](http://images.xyzzs.top/image/image-20230207092558152.png_char)

## 负载均衡

#### 权重随机

RandomLoadBalance：根据权重随机选择（对加权随机算法的实现）。这是Dubbo默认采用的一种负载均衡策略。

假如有两个提供相同服务的服务器 S1,S2，S1的权重为7，S2的权重为3。

我们把这些权重值分布在坐标区间会得到：S1->[0, 7) ，S2->[7, 10)。我们生成[0, 10) 之间的随机数，随机数落到对应的区间，我们就选择对应的服务器来处理请求。

以上就是 RandomLoadBalance 背后的算法思想，比较简单。下面开始分析源码。

```java
public class RandomLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "random";

    private final Random random = new Random();

    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size();
        int totalWeight = 0;
        boolean sameWeight = true;
        // 下面这个循环有两个作用，第一是计算总权重 totalWeight，
        // 第二是检测每个服务提供者的权重是否相同
        for (int i = 0; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            // 累加权重
            totalWeight += weight;
            // 检测当前服务提供者的权重与上一个服务提供者的权重是否相同，
            // 不相同的话，则将 sameWeight 置为 false。
            if (sameWeight && i > 0
                    && weight != getWeight(invokers.get(i - 1), invocation)) {
                sameWeight = false;
            }
        }
        
        // 下面的 if 分支主要用于获取随机数，并计算随机数落在哪个区间上
        if (totalWeight > 0 && !sameWeight) {
            // 随机获取一个 [0, totalWeight) 区间内的数字
            int offset = random.nextInt(totalWeight);
            // 循环让 offset 数减去服务提供者权重值，当 offset 小于0时，返回相应的 Invoker。
            // 举例说明一下，我们有 servers = [A, B, C]，weights = [5, 3, 2]，offset = 7。
            // 第一次循环，offset - 5 = 2 > 0，即 offset > 5，
            // 表明其不会落在服务器 A 对应的区间上。
            // 第二次循环，offset - 3 = -1 < 0，即 5 < offset < 8，
            // 表明其会落在服务器 B 对应的区间上
            for (int i = 0; i < length; i++) {
                // 让随机值 offset 减去权重值
                offset -= getWeight(invokers.get(i), invocation);
                if (offset < 0) {
                    // 返回相应的 Invoker
                    return invokers.get(i);
                }
            }
        }
        
        // 如果所有服务提供者权重值相同，此时直接随机返回一个即可
        return invokers.get(random.nextInt(length));
    }
}
```

RandomLoadBalance 的算法思想比较简单，在经过多次请求后，能够将调用请求按照权重值进行“均匀”分配。当然 RandomLoadBalance 也存在一定的缺点，<font color=orchid>当调用次数比较少时，Random 产生的随机数可能会比较集中</font>，此时多数请求会落到同一台服务器上。这个缺点并不是很严重，多数情况下可以忽略。RandomLoadBalance 是一个简单，高效的负载均衡实现，因此 Dubbo 选择它作为缺省实现。

#### 最小活跃数负载均衡

LeastActiveLoadBalance

`LeastActiveLoadBalance` 直译过来就是**最小活跃数负载均衡**。

初始状态下所有服务提供者的活跃数均为 0（每个服务提供者的中特定方法都对应一个活跃数，我在后面的源码中会提到），每收到一个请求后，对应的服务提供者的活跃数 +1，当这个请求处理完之后，活跃数 -1。

因此，Dubbo 就认为谁的活跃数越少，谁的处理速度就越快，性能也越好，这样的话，我就优先把请求给活跃数少的服务提供者处理。



**源码实现逻辑分析**，如下：

1. 遍历 invokers 列表，寻找活跃数最小的 Invoker
2. 如果有多个 Invoker 具有相同的最小活跃数，此时记录下这些 Invoker 在 invokers 集合中的下标，并累加它们的权重，比较它们的权重值是否相等
3. 如果只有一个 Invoker 具有最小的活跃数，此时直接返回该 Invoker 即可
4. 如果有多个 Invoker 具有最小活跃数，且它们的权重不相等，此时处理方式和 RandomLoadBalance 一致
5. 如果有多个 Invoker 具有最小活跃数，但它们的权重相等，此时随机返回一个即可



#### 一致性Hash负载均衡策略

`ConsistentHashLoadBalance` 即**一致性Hash负载均衡策略**。 `ConsistentHashLoadBalance` 中没有权重的概念，具体是哪个服务提供者处理请求是由你的请求的参数决定的，也就是说相同参数的请求总是发到同一个服务提供者。



**源码实现逻辑分析**，如下：

doSelect 方法主要做了一些前置工作，比如检测 invokers 列表是不是变动过，以及创建 ConsistentHashSelector。这些工作做完后，接下来开始调用 ConsistentHashSelector 的 select 方法执行负载均衡逻辑。

- ConsistentHashSelector 的构造方法执行了一系列的初始化逻辑，比如从配置中获取虚拟节点数以及参与 hash 计算的参数下标，默认情况下只使用第一个参数进行 hash。在获取虚拟节点数和参数下标配置后，接下来要做的事情是计算虚拟节点 hash 值，并将虚拟节点存储到 TreeMap 中。到此，ConsistentHashSelector 初始化工作就完成了。

-  select 方法选择的过程相对比较简单了。首先是对参数进行 md5 以及 hash 运算，得到一个 hash 值。然后再拿这个值到 TreeMap 中查找目标 Invoker 即可。

#### 加权轮询负载均衡

RoundRobinLoadBalance：轮询就是把请求依次分配给每个服务提供者。加权轮询就是在轮询的基础上，让更多的请求落到权重更大的服务提供者上。

Dubbo 中的 `RoundRobinLoadBalance` 的代码实现被修改重建了好几次，Dubbo-2.6.5 版本的 `RoundRobinLoadBalance` 为平滑加权轮询算法。



