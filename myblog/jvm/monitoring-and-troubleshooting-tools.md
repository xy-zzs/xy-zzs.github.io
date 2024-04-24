#  监控及调优导航栏

背景说明：生产中的问题

1. 生产环境发生了溢出如何处理
2. 生产环境应该给服务器分配多少内存合适
3. 如何对垃圾收集器的性能调优
4. 不加log如何确定请求是否执行了某一行代码：Btrace
5. 不加log如何实时查看某个方法的入参与返回值：Btrace

<mark>性能评价/测试指标</mark>

1. 停顿时间：

   - 在垃圾回收环节中，停顿时间指<font color=red>执行垃圾收集时，程序的工作线程被暂停</font> **STW**的时间。

   - 测试阶段中，指提交请求和返回该请求的响应之间使用的时间，一般比较关注平均响应时间。常用操作的响应时间列表：

   | 操作                       | 响应时间 |
   | -------------------------- | -------- |
   | 打开一个站点               | 几秒     |
   | 数据库查询一条记录         | 十几毫秒 |
   | 机械磁盘一次寻址定位       | 4毫秒    |
   | 从机械磁盘顺序读取 1M 数据 | 2毫秒    |
   | 从SSD 磁盘顺序读取 1M 数据 | 0.3毫秒  |
   | 从内存读取 1M 数据         | 十几微妙 |
   | Java 程序本地方法调用      | 几微妙   |
   | 网络传输2Kb 数据           | 1微妙    |

2. 吞吐量：对单位时间内完成的工作量（请求）的量度

3. 并发数：同一时刻，对服务器有实际交互的请求数

4. 内存占用：Java 堆区所占的内存大小

<mark>性能优化的步骤</mark>

1. 性能监控
2. 性能分析
3. 性能调优

## JVM监控及诊断工具

### 命令行

<mark>jps</mark>

`jps`(JVM Process Status) 可以<font color=orchid>查看所有 Java 进程</font>，命令类似 UNIX 的 `ps` 命令。

- `jps -v`：输出虚拟机进程启动时 JVM 参数。

- `jps -m`：输出传递给 Java 进程 main() 函数的参数。

<mark>jstat</mark>

`jstat`（JVM Statistics Monitoring Tool） 使用于<font color=orchid>监控虚拟机各种运行状态信息</font>的命令行工具。

```shell
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]
```

比如 `jstat -gc -h3 18140 1000 10`表示分析进程 id 为 18140的 gc 情况，每隔 1000ms 打印一次记录，打印 10 次停止，每 3 行后打印指标头部。

![image-20230205094851118](http://images.xyzzs.top/image/image-20230205094851118.png_char_char)

新生代相关：

- S0C 是第一个幸存者区的大小(字节)
- S1C 是第二个幸存者区的大小(字节)
- S0U 是第一个幸存者区已使用的大小(字节)
- S1U 是第二个幸存者区已使用的大小 (字节)
- EC 是Eden空间的大小(字节)
- EU 是Eden空间已使用大小(字节)

老年代相关：

- OC 是老年代的大小(字节)
- OU 是老年代已使用的大小(字节)

方法区(元空间)相关：

- MC 是方法区的大小
- MU 是方法区已使用的大小
- CCSC 是压缩类空间的大小
- CCSU 是压缩类空间已使用的大小

其它：

- YGC 是指从应用程序启动到采样时 young gc 次数
- YGCT 是指从应用程序启动到采样时 youn gc 消耗的时间(秒)
- FGC 是指从应用程序启动到采样时 full gc 次数
- FGCT 是指从应用程序启动到采样时 full gc 消耗的时间(秒)
- GCT 是指从应用程序启动到采样时 gc 的总时间

**常见的 option 如下：**

`jstat -class vmid` ：显示 ClassLoader 的相关信息；

`jstat -compiler vmid` ：显示 JIT 编译的相关信息；

`jstat -gc vmid` ：显示与 GC 相关的堆信息；

`jstat -gccapacity vmid` ：显示各个代的容量及使用情况；

`jstat -gcnew vmid` ：显示新生代信息；

`jstat -gcnewcapcacity vmid` ：显示新生代大小与使用情况；

`jstat -gcold vmid` ：显示老年代和永久代的行为统计，从jdk1.8开始,该选项仅表示老年代，因为永久代被移除了；

`jstat -gcoldcapacity vmid` ：显示老年代的大小；

`jstat -gcpermcapacity vmid` ：显示永久代大小，从jdk1.8开始,该选项不存在了，因为永久代被移除了；

`jstat -gcutil vmid` ：显示垃圾收集信息；

<mark>jinfo</mark>

`jinfo`（Configuration Info for Java）<font color=orchid>实时地查看和调整虚拟机各项参数</font>

`jinfo vmid` :输出当前 jvm 进程的全部参数和系统属性 (第一部分是系统的属性，第二部分是 JVM 的参数)。

`jinfo -flag name vmid` :输出对应名称的参数的具体值。

```sh
//输出 MaxHeapSize
jinfo -flag MaxHeapSize 18140
-XX:MaxHeapSize=2124414976

//查看当前 jvm 进程是否开启打印 GC 日志
jinfo -flag PrintGC 18140
-XX:-PrintGC
```

`jinfo -flag [+|-]name vmid` 开启或者关闭对应名称的参数。

```sh
//开启PrintGC功能
jinfo  -flag  +PrintGC 17340
```

但是，并非所有参数都支持动态修改。参数只有被标记为 manageable 的 flag 可以被实时修改。查看被标记为manageable的参数

```sh
java -XX:+PrintFlagsFinal -version | grep manageable
```

<mark>jmap</mark>

`jmap`（Memory Map for Java）命令用于<font color=orchid>生成堆转储快照</font>。 如果不使用 `jmap` 命令，要想获取 Java 堆转储

- 可以使用 `“-XX:+HeapDumpOnOutOfMemoryError”` 参数，可以让虚拟机<font color=orchid>在 OOM 异常出现之后自动生成 dump 文件</font>。-XX:HeapDumpPath: 可以指定堆快照的保存位置。

  ```sh
  -Xmx100m -XX:+HeapDumpOnOutofMemoryError -XX:HeapDumpPath=.../m.hprof
  ```

- Linux 命令下可以通过 `kill -3` 发送进程退出信号也能拿到 dump 文件。

`jmap` 的作用并不仅仅是为了获取 dump 文件，它还可以查询 finalizer 执行队列、Java 堆和永久代的详细信息，如空间使用率、当前使用的是哪种收集器等。和`jinfo`一样，`jmap`有不少功能在 Windows 平台下也是受限制的。

```sh
jmap -dump:format=b,file=.../heap.hprof 18140
Dumping heap to .../heap.hprof ...
Heap dump file created
```

```sh
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]
```

其中`<option>`包括

- ` -dump`：生成dump文件；`-dump:live`只保存堆中的存活对象
- `-heap`：输出整个堆空间的详细信息，包括GC的使用、堆配置信息，以及内存的使用信息等
- `-histo`：输出堆空间中对象的统计信息，包括类、实例数量和合计容量
- `-permstat`：以ClassLoader为统计口径输出永久代的内存状态信息；仅linux/solaris平台有效
- `-finalizerinfo`：以ClassLoader为统计口径输出永久代的内存状态信息；仅linux/solaris平台有效
- `-F`：当虚拟机进程对-dump选项没有任何响应时，强制执行生成dump文件；仅linux/solaris平台有效

<mark>jhat</mark>

**`jhat`** （JVM Heap Analysis Tool）是jdk自带<font color=orchid>堆分析工具</font>，用于分析 heapdump 文件，jhat内置了一个微型的 HTTP/HTML 服务器， 生成dump文件的分析结果后，用户可以在浏览器中查看分析结果。

 jhat命令在JDK9、JDK10中已经被删除，官方建议用VisualVM代替。

<mark>jstack</mark>

`jstack`（Stack Trace for Java）命令用于生成虚拟机<font color=orchid>当前时刻的线程快照</font>。线程快照就是当前虚拟机内每一条线程正在执行的方法堆栈的集合。

生成线程快照的作用：可用于定位线程出现长时间停顿的原因，如线程间死锁、死循环、请求外部资源导致的长时间等待等问题。这些都是导致线程长时间停顿的常见原因。当线程出现停顿时，就可以用istack显示各个线程调用的堆栈情况。

在thread dump中，要留意下面几种状态：

- 死锁，Deadlock（重点关注）
- 等待资源，Waiting on condition （重点关注）
- 等待获取监视器，Waiting on monitor entry （重点关注）
- 阻塞，Blocked ( 重点关注）
- 执行中，Runnable
- 暂停，Suspended

<mark>jcmd</mark>

<font color=orchid>多功能命令行工具</font>

在JDK 1.7以后，新增了一个命令行工具`jcmd`。它是一个多功能的工具，可以用来实现前面除了`jstat`之外所有命令的功能。比如: 用它来导出堆、内存使用、查看Java进程、导出线程信息、执行GC、JVM运行时间等。

<mark>jstatd</mark>

<font color=orchid>远程主机信息收集</font>

之前的指令只涉及到监控本机的 Java 应用程序，而在这些工具中，一些监控工具也支持对远程计算机的监控(如 jps 、 jstat ) 。为了启用远程监控，则需要配合使用`jstatd` 工具。
命令`jstatd`是一个RMI服务端程序，它的作用相当于代理服务器，建立本地计算机与远程监控工具的通信。`jstatd`服务器将本机的 Java 应用程序信息传递到远程计算机。

### jconsole

Jconsole （Java Monitoring and Management Console），一种基于JMX的可视化监视、管理工具。

启动：点击JDK/bin 目录下面的`jconsole.exe` 即可启动。`Jconsole `命令行也可启动

JConsole 基本包括以下基本功能：`概述`、`内存`、`线程`、`类`、`VM概要`、`MBean`

![image-20230205105344536](http://images.xyzzs.top/image/image-20230205105344536.png_char)

### Visual VM

VisualVM（All-in-One Java Troubleshooting Tool）;功能最强大的运行监视和故障处理程序

启动：点击JDK/bin 目录下面的`jvisualvm.exe` 即可启动。`jvisualvm`命令行也可启动。

Visual VM 官网：https://visualvm.github.io/ 。Visual VM 中文文档:https://visualvm.github.io/documentation.html。

其他可视化工具

- [Jprofiler](https://www.ej-technologies.com/download/jprofiler/files)
- [Arthas](https://arthas.aliyun.com/doc/)
- eclipse MAT
- Java Mission Control（JMC）—JDK自带
- 其他分析工具：
  - [BTrace 快速入门](https://blog.csdn.net/qq2430/article/details/82528767)
  - Flame Graphs (火焰图)
  - Tprofiler
  - YourKit
  - JProbe
  - Spring Insight



## JVM常用参数

### JVM参数选项类型

标准参数：`java -help`，比较稳定，基本上改动

-X参数：`java -X`

-XX参数：格式如下

```sh
-XX:NewSize=1024m		//设置数值
-XX:+printFlagsFinal  //表示启用
-XX:-printFlagsFinal  //表示禁用
```

### 打印设置的参数

- `-XX:PrintFlagsInitial`：打印初始值
- `-XX:PrintCommandlineFlags`：打印当前生效的值
- `-XX:PrintVMOptions`：打印JVM参数

### 栈

- `-Xss128`：每个线程栈的大小128k

### 堆

- `-Xms3550m`：设置 JVM 初始堆内存为3550M
- `-Xmx3550m`：设置 JVM 最大堆内存为3550M
- `-Xmn2g`：设置 JVM 年轻代大小为2G
- `-XX:NewSize=1024m`：设置年轻代初始值为1024M
- `-XX:MaxNewSize=1024m`：设置年轻代最大值为1024M
- `-XX:SurvivorRatio=8`：设置Eden与sur区的比值
- `-XX:+UserAdaptSizePolicy`：自动选择各区大小比例
- `-XX:NewRatio=4`：设置老年代与年轻的比值
- `-XX:PretenureSizeThreadshold=1024`：设置大于此阈值的对象直接分配到老年代，单位是字节
- `-XX:MaxTenuringThreadshold=15`：达到此年龄，进入老年代
- `-XX:+PrintTenuringDistribution`：让JVM每次Minor GC后打印当前 Survivor 区中对象的年龄分布 
- `-XX:TargetSurvivorRatio=`：表示 Minor GC 后 Survivor 区中占有的期望比例
- CNewRatio二4的大书酒公大，yoeghto s黄生存活的对象年龄+1，当对象的年龄大于设置的这个值时就进入老. Teugeo让NM在每次MinorGC后打印出当前使用的Suvivor中对象的年-xcTargetsurvivoRatio表示Minorc结束后SuMwor区域中占用空国的期组比

### 方法区

永久代

- `-XX:PermSize=256m`：设置永久代初始值为256M
- `-XX:MaxPermSize=256m`：设置永久代最大值为256M

元空间

- `-XX:MetaspaceSize=256m`：设置元空间初始值为256M
- `-XX:MaxMetaspaceSize=256m`：设置元空间最大值为256M

### OOM相关

- `-XX:+HeapDumpOnOutOfMemoryError`表示在内存出现OOM的时候，把Heap转存(Dump)到文件以便后续分析
- `-XX:+HeapDumpBeforeFullGC`：表示在出现 FulIGC 之前，生成Heap转储文件
- `-XX:HeapDumpPath=<path>`指定heap转存文件的存储路径
- `-XX:OnOutOfMemoryError`指定一个可行性程序或者脚本的路径，当发生OOM的时候，去执行这个脚本

### GC相关

- `-verbosegc`：输出简化的gc日志信息用
- `-XX:+PrintGC`：输出简化的gc日志信息用
- `-XX:+PrintGCDetails`：在发生垃圾回收时打印内存回收详细的日志并在进程退出时输出当前内存各区域分配情况
- `-XX:+PrintGCTimeStamps`：输出GC发生时的时间戳，不可以独立使用，需要配合-XX:+PrintGCDetails使用
- `-XX:+PrintGCDateStamps`：输出GC发生时的时间戳，不可以独立使用，需要配合-XX:+PrintGCDetails使用输出GC发生时的时间戳(以日期的形式，如2013-
- `-XX:+PrintHeapAtGC`：每一次GC前和GC后，都打印堆信息
- `-Xloggc:<file>`：把GC日志写入到一个文件中去，而不是打印到标准输出中

<mark>GC日志分析工具</mark>

- [GCEasy](https://gceasy.io/)：在线版
- GCViewer：离线版，需先[下载](https://github.com/chewiebug/GCViewer)
- GChisto
- Hpjmeter

