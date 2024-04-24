# Kafka导航栏

- **Topic** 是一个消息的<font color=orchid>逻辑</font>分类，只是一个逻辑概念，代表了一类消息。通常我们可以使用 topic 来区分实际业务，比如业务 A 使用一个 topic，业务 B 使用另外一个 topic 。

- **Partition** 是<font color=orchid>物理</font>的概念，就是物理上进行分离，分布在不同的实体机器（broke）上。
- **Replication** ： 副本，是 Kafka <font color=orchid>保证数据高可用的方式</font>，Kafka 同一 Partition 的数据可以在多 Broker 上存在多个副本，通常<font color=orchid>只有主副本对外提供读写服务</font>，当主副本所在 broker 崩溃或发生网络异常，Kafka 会在 Controller 的管理下会重新选择新的 Leader 副本对外提供读写服务。
- **Record** ： 实际写入 Kafka 中并可以被读取的消息记录。每个 record 包含了 key、value 和 timestamp。

- **Offset** ： offset 是消息在分区中的唯一标识，Kafka 通过它来<font color=orchid>保证消息在分区内的顺序性</font>，不过 offset 并不跨越分区，也就是说，Kafka 保证的是分区有序性而不是主题有序性。通俗的理解：<font color=orchid>单分区内，消费到哪儿了</font>。新版本保存在 Broker，老版本在zk中。

- **广播消息**：Kafka 通过 Consumer Group 来实现广播模式消息订阅，即不同 group 下的 consumer 可以重复消费消息，相互不影响，同一个 group 下的 consumer 构成一个整体。
- 消费者组



:question:kafka的 副本的作用 是什么

在kafka中，实现副本的目的就是冗余备份，<font color=orchid>且仅仅是冗余备份</font>，所有的读写请求都是由leader副本进行处理的。follower副本仅有一个功能，那就是从leader副本拉取消息，尽量让自己跟leader副本的内容一致。

生产者和消费者只与 leader 副本交互。可以理解为其他副本只是 leader 副本的拷贝，它们的存在只是为了<font color=orchid>提高了消息存储的安全性, 提高了容灾能力，不过也相应的增加了所需要的存储空间</font>。

那么为什么follower副本不对外提供服务？——这个问题本质上是优先保证数据的一致性。

:question:Kafka 的多分区机制有什么好处

给特定 Topic 指定多个 Partition, 而各个 Partition 可以分布在不同的 Broker 上，<font color=orchid>可以提高并发能力（负载均衡）</font>。



## kafka文件的存储形式

Kafka 消息是以 Topic 为单位进行归类，各个 Topic 之间是彼此独立的，互不影响。

每个 Topic 又可以分为一个或多个分区。每个分区各自存在一个记录消息数据的日志文件。

Kafka 每个分区日志在物理上实际按大小被分成多个 Segment；目的是为了防止log文件过大导致数据**定位效率低下**，采取**分片**和**索引**的机制。

![image-20230221131242940](http://images.xyzzs.top/image/image-20230221131242940.png_char_char)

一个 Segment 默认大小为 `1G`， 主要包含以下文件：

- `.log`文件：实实在在存储数据的文件
- `.index`偏移量索引文件：快速定位；
  - <font color=orchid>index为稀疏索引，大约每写入4KB，增加一条索引</font>。`log.index.interval.bytes`默认4KB。
  - 保存的`offset`为相对的`offset`，确保`offset`值所占空间不会过大；绝对`offse`会越来越大。
- `.timeindex`时间戳索引文件：用于`删除机制`。
- 其他文件

> 以当前segment的第一条消息的offset命名。

> **稠密索引**： 在密集索引中，数据库中的**每个搜索键值都有一个索引记录**。这样可以加快搜索速度，但需要更多空间来存储索引记录本身。索引记录包含搜索键值和指向磁盘上实际记录的指针。
>
> **稀疏索引**： 在稀疏索引中，**不会为每个搜索关键字创建索引记录**。此处的索引记录包含搜索键和指向磁盘上数据的实际指针。要搜索记录，我们首先按索引记录进行操作，然后到达数据的实际位置。如果我们要寻找的数据不是我们通过遵循索引直接到达的位置，那么系统将开始顺序搜索，直到找到所需的数据为止。



## 文件清除策略

<font color=orchid>默认的保存时间为 7天</font>，可以通过调整如下参数修改保存时间。

- `log.retention.hours`：最低优先级小时，默认168小时（7天）。
- `log.retention.minutes`：分钟。
- `log.retention.ms`：最高优先级毫秒。
- `log.retention.check.interval.ms`：设置检查周期，默认 5 分钟。



那么日志超过了设置的时间，怎么处理呢？

Kafka 中提供的日志清理策略有<font color=orchid> delete（删除） 和 compact（压缩）</font> 两种。

1. 启用删除策略：`log.cleanup.policy` = delete

   - 基于时间:默认打开。以 segment 中所有记录中的最大时间戳作为该文件时间戳。
   - 基于大小:默认关闭。超过设置的所有日志总大小，删除最早的 segment。`log.retention.bytes`，默认等于-1，表示无穷大。

2. 启用压缩策略：`log.cleanup.policy` = compact

   对于相同key的 不同value值，只保留最后一个版本。



## kafka为什么快？

1. <mark>顺序写磁盘</mark>：以追加的形式到文件末端，节省了大量磁头寻址的过程

2. <mark>零拷贝</mark>：在broker端不需要对数据进行任何，直接发往网卡，所有处理可放在生产端或者消费端进行；减少了系统调用，避免在 `用户态(User-space)` 与 `内核态(Kernel-space)` 之间来回拷贝数据。

3. <mark>页缓存</mark>：

   - producer 生产消息到 Broker 时，Broker 会使用 pwrite() 系统调用【对应到 Java NIO 的 FileChannel.write() API】按偏移量写入数据，数据都会先写入`page cache`。
   - consumer 消费消息时，Broker 使用 sendfile() 系统调用【对应 FileChannel.transferTo() API】，零拷贝地将数据从 page cache 传输到 broker 的 Socket buffer，再通过网络传输。

   > leader 与 follower 之间的同步，与上面 consumer 消费数据的过程是同理的。

   `page cache`中的数据会随着内核中 flusher 线程的调度以及对 sync()/fsync() 的调用写回到磁盘，就算进程崩溃，也不用担心数据丢失。另外，如果 <font color=orchid>consumer 要消费的消息不在`page cache`里，才会去磁盘读取</font>，并且会顺便预读出一些相邻的块放入 page cache，以方便下一次读取。

   因此如果 Kafka <font color=orchid>producer 的生产速率与 consumer 的消费速率相差不大</font>，那么就能几乎只靠对 broker page cache 的读写完成整个生产 - 消费过程，磁盘访问非常少。

4. <mark>网络模型</mark>：底层基于 Java NIO，采用和 Netty 一样的 Reactor 线程模型。

5. <mark>批量传输与压缩消息</mark>

   `Producer` 有两个重要的参数：和 `Producer` 的批量发送消息有关。

   - `batch.size`：16KB
   - ``linger.ms`：默认0ms，表示没有延迟。

   主要是为了让传输消息的次数变得更少，压缩主要是为了降低网络传输的消耗，提高吞吐量。

   `Broker` 接收到压缩后的消息块之后（建议  `Broker`  的压缩算法和 `Producer`  一样），会依次将压缩后的消息块写入文件中（注意：这个时候消息块 <font color=orchid>还是压缩的状态</font>），`Consumer` 同时会依次获取消息块，当消息块到达 `Consumer`  后，`Consumer` 才会对消息块进行解压缩（有压缩必然有解压缩）。

6. <mark>分区并发</mark>：本身就是分布式集群，可以采用分区技术，并行度高

   Kafka 的 Topic 可以分成多个 Partition，每个 Paritition 类似于一个队列，保证数据有序。同一个 Group 下的不同 Consumer 并发消费 Paritition，分区实际上是调优 Kafka 并行度的最小单元，因此，可以说， <font color=orchid>每增加一个 Paritition 就增加了一个消费并发</font>。

    <font color=orchid>但也不是越多越好</font>：

   1. 需要更多的资源
   2. 降低高可用性：分区越多，每个 Broker 上分配的分区也就越多，当一个发生 Broker 宕机，那么恢复时间将很长。

7. <mark>文件结构</mark>：

   - 读数据采用<font color=orchid>稀疏索引</font>，可以快速定位要消费的数据
   - Kafka 充分利用二分法来查找对应 offset 的消息位置：



## :star:如何保证Kafka不丢失消息?

<mark>生产者丢失消息的情况</mark>

`Producer` 使用 `send()` 方法发送消息是异步的操作，我们可以通过 `get()`方法获取调用结果，但是这样也让它变为了同步操作，示例代码如下：

```java
SendResult<String, Object> sendResult = kafkaTemplate.send(topic, o).get();
if (sendResult.getRecordMetadata() != null) {
  logger.info("生产者成功发送消息到" + sendResult.getProducerRecord().topic() + "-> " + sendRe
              sult.getProducerRecord().value().toString());
}
```

但是一般不推荐这么做！可以<font color=orchid>采用为其添加回调函数</font>的形式，示例代码如下：

```java
ListenableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, o);
future.addCallback(result -> logger.info("生产者成功发送消息到topic:{} partition:{}的消息", result.getRecordMetadata().topic(), result.getRecordMetadata().partition()),
                ex -> logger.error("生产者发送消失败，原因：{}", ex.getMessage()));
```

另外，建议根据实际情况设置以下参数：

参数 `retries` 表示生产者生产消息的<font color=orchid>重试次数</font>，可根据实际情况调整。

参数`retry.backoff.ms` 表示<font color=orchid>重试的时间间隔</font>，单位是毫秒，如果配置的时间间隔太短，服务可能仍然处于不可用状态。

如果重试次数用光后，还是消息发送失败，那么kafka会将异常信息通过[回调](https://so.csdn.net/so/search?q=回调&spm=1001.2101.3001.7020)的形式带给我们，这时，我们可以将没有发送成功的消息进行持久化，做后续的补偿处理。

<mark>消费者丢失消息的情况</mark>

当消费者拉取到了分区的某个消息之后，消费者默认会自动提交 `offset`。

我们手动关闭自动提交 `offset`，每次在真正消费完消息之后之后再自己手动提交 `offset` 。但是，细心的朋友一定会发现，这样会带来消息被重新消费的问题。比如你刚刚消费完消息之后，还没提交 `offset`，结果自己挂掉了，那么这个消息理论上就会被消费两次，所以手动提交消息需要做一些幂等性的措施。

- 同步提交
- 异步提交

<mark>Broker 弄丢了消息</mark>

<font color=orchid>ACK级别设置为all + 分区副本大于等于2 + ISR里应答的最小副本数量大于等于2</font>

1. 设置 `acks` = all

   - -1(all)：表示只有所有 ISR 列表的副本全部收到消息时，生产者才会接收到来自服务器的响应. 这种模式是最高级别的，也是最安全的，该模式的延迟会很高.
   - 1：也是默认值，代表我们的消息被leader副本接收之后就算被成功发送。
   - 0：立马响应返回，异步

   若配置为`all`，如果有一台 Follower 宕机，那么会永远无法ack

2. 设置 `replication.factor` ：分区副本大于等于2，保证即使分区的`leader`挂掉，其他`follower`被选中为leader也会正常处理消息。

3. 设置 `min.insync.replicas` ：ISR 里应答的最小副本数量大于等于2，原理同上，也需要大于 1 的副本数量来保证消息不丢失。

   > 确保 replication.factor > min.insync.replicas
   >
   > 如果两者相等，那么只要有一个副本挂机，整个分区就无法正常工作了。我们不仅要改善消息的持久性，防止数据丢失，还要在不降低可用性的基础上完成。推荐设置成 replication.factor = min.insync.replicas + 1。

4. 设置 unclean.leader.election.enable = false

   <font color=orchid>是否启用不在ISR集中的副本作为最后手段被选为leader，这样做可能导致数据丢失</font>

   发送的消息会被发送到 `Leader` 副本，然后 `Follower` 副本才能从 `Leader` 副本中拉取消息进行同步。多个 `Follower` 副本之间的消息同步情况不一样，当我们配置了 `unclean.leader.election.enable = false` 的话，当 `Leader` 副本发生故障时就不会从 `Follower` 副本中和 `Leader` 同步程度达不到要求的副本中选择出 `Leader` ，这样降低了消息丢失的可能性。

   > Kafka 0.11.0.0 版本开始 unclean.leader.election.enable 参数的默认值由原来的 true 改为 false

> 精确一次：幂等性和事务



## Kafka 如何保证消息的消费顺序？

1. 一个 Topic 只对应一个 Partition。
2. （推荐）发送消息的时候指定 key/Partition。

如何保证生产端单分区有序呢？

- kafka在1.x版本之前保证数据单分区有序，条件如下:

  `max.in.flight.requests.perconnection`=1 (不需要考虑是否开启幂等性)

- kafka在1.x及以后版本保证数据单分区有序，条件如下:

  1. 未开启幂等性：max.in.fight.requests.perconnection黑要设置为1。

  2. 开启幂等性：max.in.flight.requests.per.connection需要设置小于等于5

     原因说明：因为在kafkal,x以后，启用幂等后，kafka服务端会缓存producer发来的最近5个request的元数据，故无论如何，都可以保证最近5个request的数据都是有序的。

>  单分区有序，可能会造成数据倾斜；想要实现多分区有序，需在消费端排序。



## 分区策略

即生产者发往 Broker 时，采用何种策略

同一个 Topic 可以创建多个分区。理论上分区越多并发度越高，Kafka 会**根据分区策略将分区尽可能均衡的分布在不同的 Broker 节点上，以避免消息倾斜**，不同的 Broker 负载差异太大。分区也不是越多越好哦，毕竟太多邮政公司也管理不过来。

1. 若指定 partition，则按照 partition 发往指定的分区
2. 若未指定 partition ，但选择了 key，则按照 key 的哈希值取模后发往指定分区
3. 会随机选择一个分区，待batch满后或已完成， 再随机选一个（和上一次分区不同）——3.0版本

> 自定义分区器：实现Partitioner接口，重写partition()方法



## Kafka消费组 分区分配策略及重平衡机制

首先：一个消费者组中的消费者只能消费一个分区！

![img](http://images.xyzzs.top/image/1677028966704-9b5a4f2e-abfe-45b5-9dca-575157a6c096.png_char)

分区分配策略：`partition.assignment.strategy`，默认的赋值器是[ RangeAssignor ,  CooperativeStickyAssignor ]。

实现`org.apache.kafka.clients.consumer.ConsumerPartitionAssignor`接口允许插入一个自定义分配策略。

- Range

  首先对**同一个 topic** 的分区按序号进行排序，并对消费者按照字母顺序进行排序；

  然后通过 partition数 / consumer数来决定每个消费者应该消费几个分区。如果除不尽，前面的几个消费者将会多消费 1 个分区

  > topic个数比较多时，容易产生数据倾斜

- RoundRobin：针对集群中**所有 topic** ，把所有 partition 和所有的 consumer 都列出来，然后按照 hashCode进行排序，最好通过轮询算法来分配 partition 给到各个消费者。

- StickyAssignor：黏性，类似Range，有一定随机性

- CooperativeStickyAssignor：合作者黏性



**假如某个  Consumer Group  突然加入或者退出了一个 Consumer，会发生什么情况呢？**

会触发 **重平衡** ，它本质上是一种协议，规定了一个 Consumer Group 下的所有 Consumer 如何达成一致来分配订阅 Topic 的每个分区。



## zookeeper 存储

ZooKeeper 主要为 Kafka 提供元数据的管理的功能。

![image.png](http://images.xyzzs.top/image/1677032584417-2a5caeeb-d674-4f31-9760-2d728390a041.png_char)

- Kafka Controller 的 Leader 选举
- Kafka 集群成员管理
- Topic 配置管理
- 分区副本管理

Zookeeper 主要为 Kafka 做了下面这些事情：

1. **Broker 注册** ：在 Zookeeper 上会有一个专门**用来进行 Broker 服务器列表记录**的节点。每个 Broker 在启动时，都会到 Zookeeper 上进行注册，即到/brokers/ids 下创建属于自己的节点。每个 Broker 就会将自己的 IP 地址和端口等信息记录到该节点中去
2. **Topic 注册** ： 在 Kafka 中，同一个**Topic 的消息会被分成多个分区**并将其分布在多个 Broker 上，**这些分区信息及与 Broker 的对应关系**也都是由 Zookeeper 在维护。比如我创建了一个名字为 my-topic 的主题并且它有两个分区，对应到 zookeeper 中会创建这些文件夹：`/brokers/topics/my-topic/Partitions/0`、`/brokers/topics/my-topic/Partitions/1`
3. **负载均衡** ： Kafka 通过给特定 Topic 指定多个 Partition, 而各个 Partition 可以分布在不同的 Broker 上, 这样便能提供比较好的并发能力。 对于同一个 Topic 的不同 Partition，Kafka 会尽力将这些 Partition 分布到不同的 Broker 服务器上。当生产者产生消息后也会尽量投递到不同 Broker 的 Partition 里面。当 Consumer 消费的时候，Zookeeper 可以根据当前的 Partition 数量以及 Consumer 数量来实现动态负载均衡。
4. 等等。。。。

>  2.8版本后，采用 Kraft模式，不再依赖 zk ，但此版本还可以兼容 zk。



## 高可用

### 备份机制

Kafka 允许同一个 Partition 存在多个消息副本，每个 Partition 的副本通常由 1 个 Leader 及 0 个以上的 Follower 组成，生产者将消息直接发往对应 Partition 的 Leader，Follower 会周期地向 Leader 发送同步请求

<font color=orchid>同一 Partition 的 Replica 不应存储在同一个 Broker 上</font>，因为一旦该 Broker 宕机，对应 Partition 的所有 Replica 都无法工作，这就达不到高可用的效果

所以 Kafka 会尽量将所有的 Partition 以及各 Partition 的副本均匀地分配到整个集群的各个 Broker 上

### ISR 机制

<mark>ISR 副本集合</mark>

ISR 中的副本都是与 Leader 同步的副本，相反，不在 ISR 中的追随者副本就被认为是与 Leader 不同步的

这里的保持同步不是指与 Leader 数据保持完全一致，只需在`replica.lag.time.max.ms`<font color=orchid>时间内与 Leader 保持有效连接</font>。Follower 周期性地向 Leader 发送 FetchRequest 请求，发送时间间隔配置在`replica.fetch.wait.max.ms`中，默认值为 500

各 Partition 的 Leader 负责维护 ISR 列表并将 ISR 的变更同步至 ZooKeeper，被移出 ISR 的 Follower 会继续向 Leader 发 FetchRequest 请求，试图再次跟上 Leader 重新进入 ISR

<mark>Unclean 领导者选举</mark>

当 Kafka 中`unclean.leader.election.enable`配置为 true(默认值为 false)。在 ISR 中所有副本均宕机的情况下，才被允许 ISR 外的副本被选为 Leader，此时会丢失部分已应答的数据

开启 Unclean 领导者选举可能会造成数据丢失，但好处是，它<font color=orchid>使得分区 Leader 一直存在，不至于停止对外提供服务</font>，因此提升了高可用性，反之，禁止 Unclean 领导者选举的好处在于维护了数据的一致性，避免了消息丢失，但牺牲了高可用性

### ACK 机制

- **「acks=0」**

生产者无需等待服务端的任何确认，消息被添加到生产者套接字缓冲区后就视为已发送，因此 acks=0 不能保证服务端已收到消息

- **「acks=1」**

只要 `Partition Leader` 接收到消息而且写入本地磁盘了，就认为成功了，不管它其他的 Follower 有没有同步过去这条消息了

- **「acks=all (-1) 」**

Leader 将等待 ISR 中的所有副本确认后再做出应答，因此只要 ISR 中任何一个副本还存活着，这条应答过的消息就不会丢失

acks=all 是可用性最高的选择，但等待 Follower 应答引入了额外的响应时间。Leader 需要等待 ISR 中所有副本做出应答，此时<font color=orchid>响应时间取决于 ISR 中最慢的</font>那台机器

Broker 有个配置项`min.insync.replicas`(默认值为 1)代表了正常写入生产者数据所需要的最少 ISR 个数

当 ISR 中的副本数量小于`min.insync.replicas`时，Leader 停止写入生产者生产的消息，并向生产者抛出 NotEnoughReplicas 异常，阻塞等待更多的 Follower 赶上并重新进入 ISR

被 Leader 应答的消息都至少有`min.insync.replicas`个副本，因此能够容忍`min.insync.replicas-1`个副本同时宕机

### 故障恢复机制

首先需要在集群所有 Broker 中选出一个 Controller，负责各 Partition 的 Leader 选举以及 Replica 的重新分配

当出现 Leader 故障后，Controller 会将 Leader/Follower 的变动通知到需为此作出响应的 Broker。

Kafka 使用 ZooKeeper 存储 Broker、Topic 等状态数据，Kafka 集群中的 Controller 和 Broker 会在 ZooKeeper 指定节点上注册 Watcher(事件监听器)，以便在特定事件触发时，由 ZooKeeper 将事件通知到对应 Broker

<mark>Broker 故障恢复流程</mark>

**「当 Broker 发生故障后，由 Controller 负责选举受影响 Partition 的新 Leader 并通知到相关 Broker」**

- 当 Broker 出现故障与 ZooKeeper 断开连接后，该 Broker 在 ZooKeeper 对应的 znode 会自动被删除，ZooKeeper 会触发 Controller 注册在该节点的 Watcher；
- Controller 从 ZooKeeper 的`/brokers/ids`节点上获取宕机 Broker 上的所有 Partition；
- Controller 再从 ZooKeeper 的`/brokers/topics`获取所有 Partition 当前的 ISR；
- 对于宕机 Broker 是 Leader 的 Partition，Controller 从 ISR 中选择幸存的 Broker 作为新 Leader；
- 最后 Controller 通过 LeaderAndIsrRequest 请求向的 Broker 发送 LeaderAndISRRequest 请求。

<mark>Controller 故障恢复流程</mark>

集群中的 Controller 也会出现故障，因此 Kafka 让所有 Broker 都在 ZooKeeper 的 Controller 节点上注册一个 Watcher

Controller 发生故障时对应的 Controller 临时节点会自动删除，此时注册在其上的 Watcher 会被触发，所有活着的 Broker 都会去竞选成为新的 Controller(即创建新的 Controller 节点，由 ZooKeeper 保证只会有一个创建成功)

竞选成功者即为新的 Controller。

## 选举

<font color=orchid>在 ISR 中存活为前提，按照AR中排在签名的优先。</font>

![image.png](http://images.xyzzs.top/image/1677033107884-909b1a15-04d7-4fff-9740-517fec12bd8c.png_char)

宕机后恢复，会打乱 ISR 顺序



压测结果