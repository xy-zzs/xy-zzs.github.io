#  Spring Cloud 导航栏

## sentinel

可实现流量控制、熔断降级、系统负载保护等，比Hystrix功能更加丰富；

关于限流的算法大体上可以分为四类：固定窗口计数器、滑动窗口计数器、漏桶(也有称漏斗，英文Leaky bucket)、令牌桶(英文Token bucket)。

### 固定窗口

固定窗口，相比其他的限流算法，这应该是最简单的一种。它简单地对一个固定的时间窗口内的请求数量进行计数，如果超过请求数量的阈值，将被直接丢弃。

这个简单的限流算法优缺点都很明显。优点的话就是简单，缺点举个例子来说。

比如我们下图中的黄色区域就是固定时间窗口，默认时间范围是60s，限流数量是100。如图中括号内所示，前面一段时间都没有流量，刚好后面30秒内来了100个请求，此时因为没有超过限流阈值，所以请求全部通过，然后下一个窗口的20秒内同样通过了100个请求。所以变相的相当于在这个括号的40秒的时间内就通过了200个请求，超过了我们限流的阈值。

![image-20230205204252583](http://images.xyzzs.top/image/image-20230205204252583.png_char)

### 滑动窗口

为了优化这个问题，于是有了滑动窗口算法，顾名思义，滑动窗口就是时间窗口在随着时间推移不停地移动。

滑动窗口把一个固定时间窗口再继续拆分成N个小窗口，然后对每个小窗口分别进行计数，所有小窗口请求之和不能超过我们设定的限流阈值。

以下图举例子来说，假设我们的窗口拆分成了3个小窗口，小窗口都是20s，同样基于上面的例子，当在第三个20s的时候来了100个请求，可以通过。

然后时间窗口滑动，下一个20s请求又来了100个请求，此时我们滑动窗口的60s范围内请求数量肯定就超过100了啊，所以请求被拒绝。

![](http://images.xyzzs.top/image/image-20230205204422691.png_char_char)

### 漏桶Leaky bucket

漏桶算法，人如其名，他就是一个漏的桶，不管请求的数量有多少，最终都会以固定的出口流量大小匀速流出，如果请求的流量超过漏桶大小，那么超出的流量将会被丢弃。

也就是说流量流入的速度是不定的，但是流出的速度是恒定的。

这个和MQ削峰填谷的思想比较类似，在面对突然激增的流量的时候，通过漏桶算法可以做到匀速排队，固定速度限流。

漏桶算法的优势是匀速，匀速是优点也是缺点，很多人说漏桶不能处理突增流量，这个说法并不准确。

漏桶本来就应该是为了处理间歇性的突增流量，流量一下起来了，然后系统处理不过来，可以在空闲的时候去处理，防止了突增流量导致系统崩溃，保护了系统的稳定性。

但是，换一个思路来想，其实这些突增的流量对于系统来说完全没有压力，你还在慢慢地匀速排队，其实是对系统性能的浪费。

所以，对于这种有场景来说，令牌桶算法比漏桶就更有优势。

### 令牌桶token bucket

令牌桶算法是指系统以一定地速度往令牌桶里丢令牌，当一个请求过来的时候，会去令牌桶里申请一个令牌，如果能够获取到令牌，那么请求就可以正常进行，反之被丢弃。

现在的令牌桶算法，像 Guava 和 Sentinel 的实现都有冷启动/预热的方式，为了避免在流量激增的同时把系统打挂，令牌桶算法会在最开始一段时间内冷启动，随着流量的增加，系统会根据流量大小动态地调整生成令牌的速度，最终直到请求达到系统的阈值。



漏桶算法和令牌桶算法的区别 

漏桶算法与令牌桶算法的区别在于：漏桶算法能够强行限制数据的传输速率。令牌桶算法能够在限制数据的平均传输速率的同时还允许某种程度的突发传输。需要说明的是：在某些情况下，漏桶算法不能够有效地使用网络资源。因为漏桶的漏出速率是固定的，所以即使网络中没有发生拥塞，漏桶算法也不能使某一个单独的数据流达到端口速率。因此，漏桶算法对于存在突发特性的流量来说缺乏效率。而令牌桶算法则能够满足这些具有突发特性的流量。通常，漏桶算法与令牌桶算法结合起来为网络流量提供更高效的控制



### 源码分析

sentinel中统计用到了滑动窗口算法，然后也有用到漏桶、令牌桶算法。

<mark>滑动窗口算法</mark>

sentinel中就使用到了滑动窗口算法来进行统计，不过他的实现和我上面画的图有点不一样，实际上sentinel中的滑动窗口用一个圆形来描述更合理一点。

前期就是创建节点，然后slot串起来就是一个责任链模式，StatisticSlot通过滑动窗口来统计数据，FlowSlot是真正限流的逻辑，还有一些降级、系统保护的措施，最终形成了整个sentinel的限流方式。

![image-20230205205419588](http://images.xyzzs.top/image/image-20230205205419588.png_char)

滑动窗口的实现主要可以看LeapArray的代码，默认的话定义了时间窗口的相关参数。

对于sentinel来说其实窗口分为秒和分钟两个级别，秒的话窗口数量是2，分钟则是60个窗口，每个窗口的时间长度是1s，总的时间周期就是60s，分成60个窗口，这里我们就以分钟级别的统计来说。

```java
public abstract class LeapArray<T> {
    //窗口时间长度，毫秒数，默认1000ms
    protected int windowLengthInMs;
    //窗口数量，默认60
    protected int sampleCount;
    //毫秒时间周期，默认60*1000
    protected int intervalInMs;
    //秒级时间周期，默认60
    private double intervalInSecond;
    //时间窗口数组
    protected final AtomicReferenceArray<WindowWrap<T>> array;
}
```

然后我们要看的就是它是怎么计算出当前窗口的，其实源码里写的听清楚的，但是如果你按照之前想象把他当做一条直线延伸去想的话估计不太好理解。

首先计算数组索引下标和时间窗口时间这个都比较简单，难点应该大部分在于第三点窗口大于old这个是什么鬼，详细说下这几种情况。

1. 数组中的时间窗口是是空的，这个说明时间走到了我们初始化的时间之后了，此时new一个新的窗口通过CAS的方式去更新，然后返回这个新的窗口就好了。
2. 第二种情况是刚好时间窗口的时间相等，那么直接返回，没啥好说的
3. 第三种情况就是比较难以理解的，可以参看两条时间线的图，就比较好理解了，第一次时间窗口走完了达到1200，然后圆形时间窗口开始循环，新的时间起始位置还是1200，然后时间窗口的时间来到1676，B2的位置如果还是老的窗口那么就是600，所以我们要重置之前的时间窗口的时间为当前的时间。
4. 最后一种一般情况不太可能发生，除非时钟回拨这样子

从这个我们可以发现就是针对每个WindowWrap时间窗口都进行了统计，最后实际上在后面的几个地方都会用到时间窗口统计的QPS结果，这里就不再赘述了，知道即可。

```java
private int calculateTimeIdx(/*@Valid*/ long timeMillis) {
    long timeId = timeMillis / windowLengthInMs;
    // Calculate current index so we can map the timestamp to the leap array.
    return (int) (timeId % array.length());
}

protected long calculateWindowStart(/*@Valid*/ long timeMillis) {
    return timeMillis - timeMillis % windowLengthInMs;
}

public WindowWrap<T> currentWindow(long timeMillis) {
    //当前时间如果小于0，返回空
    if (timeMillis < 0) {
        return null;
    }
    //计算时间窗口的索引
    int idx = calculateTimeIdx(timeMillis);
    // 计算当前时间窗口的开始时间
    long windowStart = calculateWindowStart(timeMillis);

    while (true) {
        //在窗口数组中获得窗口
        WindowWrap<T> old = array.get(idx);
        if (old == null) {
            /*
             *     B0       B1      B2    NULL      B4
             * ||_______|_______|_______|_______|_______||___
             * 200     400     600     800     1000    1200  timestamp
             *                             ^
             *                          time=888
             * 比如当前时间是888，根据计算得到的数组窗口位置是个空，所以直接创建一个新窗口就好了
             */
            WindowWrap<T> window = new WindowWrap<T>(windowLengthInMs, windowStart, newEmptyBucket(timeMillis));
            if (array.compareAndSet(idx, null, window)) {
                // Successfully updated, return the created bucket.
                return window;
            } else {
                // Contention failed, the thread will yield its time slice to wait for bucket available.
                Thread.yield();
            }
        } else if (windowStart == old.windowStart()) {
            /*
             *     B0       B1      B2     B3      B4
             * ||_______|_______|_______|_______|_______||___
             * 200     400     600     800     1000    1200  timestamp
             *                             ^
             *                          time=888
             * 这个更好了，刚好等于，直接返回就行
             */
            return old;
        } else if (windowStart > old.windowStart()) {
            /*
             *     B0       B1      B2     B3      B4
             * |_______|_______|_______|_______|_______||___
             * 200     400     600     800     1000    1200  timestamp
             *             B0       B1      B2    NULL      B4
             * |_______||_______|_______|_______|_______|_______||___
             * ...    1200     1400    1600    1800    2000    2200  timestamp
             *                              ^
             *                           time=1676
             * 这个要当成圆形理解就好了，之前如果是1200一个完整的圆形，然后继续从1200开始，如果现在时间是1676，落在在B2的位置，
             * 窗口开始时间是1600，获取到的old时间其实会是600，所以肯定是过期了，直接重置窗口就可以了
             */
            if (updateLock.tryLock()) {
                try {
                    // Successfully get the update lock, now we reset the bucket.
                    return resetWindowTo(old, windowStart);
                } finally {
                    updateLock.unlock();
                }
            } else {
                Thread.yield();
            }
        } else if (windowStart < old.windowStart()) {
            // 这个不太可能出现，嗯。。时钟回拨
            return new WindowWrap<T>(windowLengthInMs, windowStart, newEmptyBucket(timeMillis));
        }
    }
}
```

<mark>漏桶</mark>

sentinel主要根据FlowSlot中的流控进行流量控制，其中RateLimiterController就是漏桶算法的实现，这个实现相比其他几个还是简单多了，稍微看一下应该就明白了。

1. 首先计算出当前请求平摊到1s内的时间花费，然后去计算这一次请求预计时间
2. 如果小于当前时间的话，那么以当前时间为主，返回即可
3. 反之如果超过当前时间的话，这时候就要进行排队等待了，等待的时候要判断是否超过当前最大的等待时间，超过就直接丢弃
4. 没有超过就更新上一次的通过时间，然后再比较一次是否超时，还超时就重置时间，反之在等待时间范围之内的话就等待，如果都不是那就可以通过了

```java
public class RateLimiterController implements TrafficShapingController {
  //最大等待超时时间，默认500ms
  private final int maxQueueingTimeMs;
  //限流数量
  private final double count;
  //上一次的通过时间
  private final AtomicLong latestPassedTime = new AtomicLong(-1);

  @Override
  public boolean canPass(Node node, int acquireCount, boolean prioritized) {
      // Pass when acquire count is less or equal than 0.
      if (acquireCount <= 0) {
          return true;
      }
      // Reject when count is less or equal than 0.
      // Otherwise,the costTime will be max of long and waitTime will overflow in some cases.
      if (count <= 0) {
          return false;
      }

      long currentTime = TimeUtil.currentTimeMillis();
      //时间平摊到1s内的花费
      long costTime = Math.round(1.0 * (acquireCount) / count * 1000); // 1 / 100 * 1000 = 10ms

      //计算这一次请求预计的时间
      long expectedTime = costTime + latestPassedTime.get();

      //花费时间小于当前时间，pass，最后通过时间 = 当前时间
      if (expectedTime <= currentTime) {
          latestPassedTime.set(currentTime);
          return true;
      } else {
          //预计通过的时间超过当前时间，要进行排队等待，重新获取一下，避免出现问题，差额就是需要等待的时间
          long waitTime = costTime + latestPassedTime.get() - TimeUtil.currentTimeMillis();
          //等待时间超过最大等待时间，丢弃
          if (waitTime > maxQueueingTimeMs) {
              return false;
          } else {
              //反之，可以更新最后一次通过时间了
              long oldTime = latestPassedTime.addAndGet(costTime);
              try {
                  waitTime = oldTime - TimeUtil.currentTimeMillis();
                  //更新后再判断，还是超过最大超时时间，那么就丢弃，时间重置
                  if (waitTime > maxQueueingTimeMs) {
                      latestPassedTime.addAndGet(-costTime);
                      return false;
                  }
                  //在时间范围之内的话，就等待
                  if (waitTime > 0) {
                      Thread.sleep(waitTime);
                  }
                  return true;
              } catch (InterruptedException e) {
              }
          }
      }
      return false;
  }
}
```

<mark>令牌桶</mark>

最后是令牌桶，这个不在于实现的复制，而是你看源码会发现都算的些啥玩意儿。。。sentinel的令牌桶实现基于Guava，代码在WarmUpController中。

这个算法那些各种计算逻辑其实我们可以不管（因为我也没看懂。。），但是流程上我们是清晰的就可以了。

几个核心的参数看注释，构造方法里那些计算逻辑暂时不管他是怎么算的（我也没整明白，但是不影响我们理解），关键看canPass是怎么做的。

1. 拿到当前窗口和上一个窗口的QPS
2. 填充令牌，也就是往桶里丢令牌，然后我们先看填充令牌的逻辑

```java
public class WarmUpController implements TrafficShapingController {
    //限流QPS
    protected double count;
    //冷启动系数，默认=3
    private int coldFactor;
    //警戒的令牌数
    protected int warningToken = 0;
    //最大令牌数
    private int maxToken;
    //斜率，产生令牌的速度
    protected double slope;

    //存储的令牌数量
    protected AtomicLong storedTokens = new AtomicLong(0);
    //最后一次填充令牌时间
    protected AtomicLong lastFilledTime = new AtomicLong(0);

    public WarmUpController(double count, int warmUpPeriodInSec, int coldFactor) {
        construct(count, warmUpPeriodInSec, coldFactor);
    }

    public WarmUpController(double count, int warmUpPeriodInSec) {
        construct(count, warmUpPeriodInSec, 3);
    }

    private void construct(double count, int warmUpPeriodInSec, int coldFactor) {
        if (coldFactor <= 1) {
            throw new IllegalArgumentException("Cold factor should be larger than 1");
        }
        this.count = count;
        this.coldFactor = coldFactor;

        //stableInterval 稳定产生令牌的时间周期，1/QPS
        //warmUpPeriodInSec 预热/冷启动时间 ,默认 10s
        warningToken = (int)(warmUpPeriodInSec * count) / (coldFactor - 1);
        maxToken = warningToken + (int)(2 * warmUpPeriodInSec * count / (1.0 + coldFactor));
    //斜率的计算参考Guava，当做一个固定改的公式
        slope = (coldFactor - 1.0) / count / (maxToken - warningToken);
    }

    @Override
    public boolean canPass(Node node, int acquireCount, boolean prioritized) {
        //当前时间窗口通过的QPS
        long passQps = (long) node.passQps();
        //上一个时间窗口QPS
        long previousQps = (long) node.previousPassQps();
        //填充令牌
        syncToken(previousQps);

        // 开始计算它的斜率
        // 如果进入了警戒线，开始调整他的qps
        long restToken = storedTokens.get();
        if (restToken >= warningToken) {
            //当前的令牌超过警戒线，获得超过警戒线的令牌数
            long aboveToken = restToken - warningToken;
            // 消耗的速度要比warning快，但是要比慢
            // current interval = restToken*slope+1/count
            double warningQps = Math.nextUp(1.0 / (aboveToken * slope + 1.0 / count));
            if (passQps + acquireCount <= warningQps) {
                return true;
            }
        } else {
            if (passQps + acquireCount <= count) {
                return true;
            }
        }

        return false;
    }
}
```

1. 最开始的事实因为lastFilledTime和oldValue都是0，所以根据当前时间戳会得到一个非常大的数字，最后和maxToken取小的话就得到了最大的令牌数，所以第一次初始化的时候就会生成maxToken的令牌
2. 之后我们假设系统的QPS一开始很低，然后突然飙高。所以开始的时候回一直走到高于警戒线的逻辑里去，然后passQps又很低，所以会一直处于把令牌桶填满的状态（currentTime - lastFilledTime.get()会一直都是1000，也就是1秒），所以每次都会填充最大QPScount数量的令牌
3. 然后突增流量来了，QPS瞬间很高，慢慢地令牌数量就会消耗到警戒线之下，走到我们if的逻辑里去，然后去按照count数量增加令牌

```java
private long coolDownTokens(long currentTime, long passQps) {
  long oldValue = storedTokens.get();
  long newValue = oldValue;

  //水位低于警戒线，就生成令牌
  if (oldValue < warningToken) {
    //如果桶中令牌低于警戒线，根据上一次的时间差，得到新的令牌数，因为去掉了毫秒，1秒生成的令牌就是阈值count
    //第一次都是0的话，会生成count数量的令牌
    newValue = (long)(oldValue + (currentTime - lastFilledTime.get()) * count / 1000);
  } else if (oldValue > warningToken) {
    //反之，如果是高于警戒线，要判断QPS。因为QPS越高，生成令牌就要越慢，QPS低的话生成令牌要越快
    if (passQps < (int)count / coldFactor) {
      newValue = (long)(oldValue + (currentTime - lastFilledTime.get()) * count / 1000);
    }
  }
  //不要超过最大令牌数
  return Math.min(newValue, maxToken);
}
```

上面的逻辑理顺之后，我们就可以继续看限流的部分逻辑：

1. 令牌计算的逻辑完成，然后判断是不是超过警戒线，按照上面的说法，低QPS的状态肯定是一直超过的，所以会根据斜率来计算出一个warningQps，因为我们处于冷启动的状态，所以这个阶段就是要根据斜率来计算出一个QPS数量，让流量慢慢地达到系统能承受的峰值。举个例子，如果count是100，那么在QPS很低的情况下，令牌桶一直处于满状态，但是系统会控制QPS，实际通过的QPS就是warningQps，根据算法可能只有10或者20（怎么算的不影响理解）。QPS主键提高的时候，aboveToken再逐渐变小，整个warningQps就在逐渐变大，直到走到警戒线之下，到了else逻辑里。
2. 流量突增的情况，就是else逻辑里低于警戒线的情况，我们令牌桶在不停地根据count去增加令牌，这时候消耗令牌的速度超过我们生成令牌的速度，可能就会导致一直处于警戒线之下，这时候判断当然就需要根据最高QPS去判断限流了。

```java
long restToken = storedTokens.get();
 if (restToken >= warningToken) {
  //当前的令牌超过警戒线，获得超过警戒线的令牌数
  long aboveToken = restToken - warningToken;
  // 消耗的速度要比warning快，但是要比慢
  // current interval = restToken*slope+1/count
  double warningQps = Math.nextUp(1.0 / (aboveToken * slope + 1.0 / count));
  if (passQps + acquireCount <= warningQps) {
   return true;
  }
 } else {
  if (passQps + acquireCount <= count) {
   return true;
  }
}
```

所以，按照低QPS到突增高QPS的流程，来想象一下这个过程：

1. 刚开始，系统的QPS非常低，初始化我们就直接把令牌桶塞满了
2. 然后这个低QPS的状态持续了一段时间，因为我们一直会填充最大QPS数量的令牌（因为取最小值，所以其实桶里令牌基本不会有变化），所以令牌桶一直处于满的状态，整个系统的限流也处于一个比较低的水平
    这以上的部分一直处于警戒线之上，实际上就是叫做冷启动/预热的过程。
3. 接着系统的QPS突然激增，令牌消耗速度太快，就算我们每次增加最大QPS数量的令牌任然无法维持消耗，所以桶里的令牌在不断低减少，这个时候，冷启动阶段的限制QPS也在不断地提高，最后直到桶里的令牌低于警戒线
4. 低于警戒线之后，系统就会按照最高QPS去限流，这个过程就是系统在逐渐达到最高限流的过程

那这样一来，实际就达到了我们处理突增流量的目的，整个系统在慢慢地适应突然飙高的QPS，然后最终达到系统的QPS阈值。

![image-20230205210225845](http://images.xyzzs.top/image/image-20230205210225845.png_char)





## nacos

主要的功能有注册中心和配置中心，可以代替 Eureka 和 Apollo 两个组件

[详解配置自动刷新原理](https://blog.csdn.net/weixin_38308374/article/details/119743062?ops_request_misc=&request_id=&biz_id=102&utm_term=nacos%E8%87%AA%E5%8A%A8%E5%88%B7%E6%96%B0%E9%85%8D%E7%BD%AE&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-2-119743062.142^v73^control,201^v4^add_ask,239^v1^control&spm=1018.2226.3001.4187)

[源码解读](https://www.shaoqun.com/a/1455779.html)

[长轮询实现](https://blog.csdn.net/qq_18478183/article/details/127153915?ops_request_misc=&request_id=&biz_id=102&utm_term=%E9%95%BF%E8%BD%AE%E8%AF%A2%20%E5%AE%9E%E7%8E%B0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-127153915.142^v73^control_1,201^v4^add_ask,239^v2^insert_chatgpt&spm=1018.2226.3001.4187)

核心思想

Nacos实现配置的动态刷新，主要是靠客户端的长轮询去请求服务端获取更新的配置，在通过Spring的ApplicationContext.publishEvent() 发布事件的方式去刷新容器。

其实主要是靠Nacos—config包下的NacosContextRefresher、NacosConfigManager这两个核心。

NacosContextRefresher主要是做桥梁的作用，通过ApplicationContext获取上下文信息，通过ApplicationListener来通知事件的发布更新Spring容器。

NacosConfigManager作为配置的启动，创建长轮询的定时任务，定时执行任务获取更新的配置。



## Seata

提供高性能和简单易用的分布式事务服务；

- AT模式：基于支持本地 ACID 事务的关系型数据库，是一种无侵入弱一致的2pc模式：

  一阶段 prepare 行为：在本地事务中，一并提交业务数据更新和相应回滚日志记录。

  二阶段 commit 行为：马上成功结束，自动 异步批量清理回滚日志。

  二阶段 rollback 行为：通过回滚日志，自动 生成补偿操作，完成数据回滚。

  关于读写的隔离：

  写隔离：AT模式会基于全局锁保证写隔离，事务操作必须获取到全局锁才能执行commit或rollback，获取不到会重试直到超时，超时后会回滚本地事务，以此避免脏写；

  读隔离：AT模式默认的读隔离级别为读未提交，出于性能考虑，一般的SELECT语句都不会阻塞，目前只对SELECT FOR UPDATE语句进行全局锁控制。

- TCC模式：不依赖于底层数据资源的事务支持：

  一阶段 prepare 行为：调用 自定义 的 prepare 逻辑。

  二阶段 commit 行为：调用 自定义 的 commit 逻辑。

  三阶段 rollback 行为：调用 自定义 的 rollback 逻辑。

- Saga模式：是SEATA提供的长事务解决方案，在Saga模式中，业务流程中每个参与者都提交本地事务，当出现某一个参与者失败则补偿前面已经成功的参与者，一阶段正向服务和二阶段补偿服务都由业务开发实现。

  适用场景：

  ​	业务流程长、业务流程多；

  ​	参与者包含其它公司或遗留系统服务，无法提供 TCC 模式要求的三个接口。
  优点：

  ​	一阶段提交本地事务，无锁，高性能；

  ​	事件驱动架构，参与者可异步执行，高吞吐；

  ​	补偿服务易于实现。
  缺点：

  ​	不保证隔离性（回滚时发现数据已被修改，导致无法回滚）。

- XA模式

  是分布式强一致性的解决方案，但性能低而使用较少，很多模式都是基于XA进行改进。



## Gateway

高性能异步非阻塞网关；
