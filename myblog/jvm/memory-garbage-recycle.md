# 内存区域与垃圾回收导航栏



## JVM内存区域

![image-20230131152434233](http://images.xyzzs.top/image/image-20230131152434233.png_char_char)



### 程序计数器

程序计数器是一块较小的内存空间，记录正在执行的虚拟机字节码指令的地址（如果正在执行的是本地方法则为空）。

为了线程切换后能恢复到正确的执行位置，每条线程都需要有一个独立的程序计数器，各线程之间计数器互不影响，独立存储，我们称这类内存区域为“线程私有”的内存。

程序计数器是唯一一个不会出现 `OutOfMemoryError` 的内存区域，它的生命周期随着线程的创建而创建，随着线程的结束而死亡。

### Java虚拟机栈

栈绝对算的上是 JVM 运行时数据区域的一个核心，除了一些 Native 方法调用是通过本地方法栈实现的，其他所有的 Java 方法调用都是通过栈来实现的。

方法调用的数据需要通过栈进行传递，每一次方法调用都会有一个对应的栈帧被压入栈中，每一个方法调用结束后，都会有一个栈帧被弹出。

栈由一个个栈帧组成，而每个栈帧中都拥有：局部变量表、操作数栈、动态链接、方法返回地址。和数据结构上的栈类似，两者都是先进后出的数据结构，只支持出栈和入栈两种操作。

<font color=orchid>栈</font>的生命周期和线程相同，随着<font color=orchid>线程</font>的创建而创建，随着线程的死亡而死亡。

<font color=orchid>栈帧</font>随着方法调用而创建，随着<font color=orchid>方法</font>结束而销毁。无论方法正常完成还是异常完成都算作方法结束。

- `StackOverFlowError`： 若栈的内存大小<font color=orchid>不允许动态扩展</font>，那么当线程请求栈的深度超过当前 Java 虚拟机栈的最大深度的时候，就抛出 StackOverFlowError错误。

- `OutOfMemoryError`： 如果栈的内存大小<font color=orchid>可以动态扩展</font>， 如果虚拟机在动态扩展栈时无法申请到足够的内存空间，则抛出 OutOfMemoryError 异常。

#### 局部变量表

主要存放了编译期可知的各种数据类型（boolean、byte、char、short、int、float、long、double）、对象引用（reference 类型，它不同于对象本身，可能是一个指向对象起始地址的引用指针，也可能是指向一个代表对象的句柄或其他与此对象相关的位置）。

#### 操作数栈

主要作为方法调用的中转站使用，用于存放方法执行过程中产生的中间计算结果。另外，计算过程中产生的临时变量也会放在操作数栈中。

#### 动态链接

主要服务一个方法需要调用其他方法的场景。在 Java 源文件被编译成字节码文件时，所有的变量和方法引用都作为符号引用（Symbilic Reference）保存在 Class 文件的常量池里。当一个方法要调用其他方法，需要将常量池中指向方法的符号引用转化为其在内存地址中的直接引用。<font color=orchid>动态链接的作用就是为了将符号引用转换为调用方法的直接引用</font>。

#### 方法返回地址

保存PC寄存器的值

调用者的PC计数器的值作为返回地址，即调用该方法的指令的下一跳指令的地址。



### 本地方法栈

和虚拟机栈所发挥的作用非常相似，区别是： **虚拟机栈为虚拟机执行 Java 方法 （也就是字节码）服务，而本地方法栈则为虚拟机使用到的 Native 方法服务。** 本地方法一般是用其它语言（C、C++ 或汇编语言等）编写的，并且被编译为基于本机硬件和操作系统的程序，对待这些方法需要特别处理。

本地方法被执行的时候，在本地方法栈也会创建一个栈帧，用于存放该本地方法的局部变量表、操作数栈、动态链接、出口信息。

方法执行完毕后相应的栈帧也会出栈并释放内存空间，也会出现 `StackOverFlowError` 和 `OutOfMemoryError` 两种错误。



### 堆

Java 虚拟机所管理的内存中最大的一块，在虚拟机启动时创建。**此内存区域的唯一目的就是存放对象实例，几乎所有的对象实例以及数组都在这里分配内存。**

Java 世界中**几乎**所有的对象都在堆中分配，那么<font color=orchid>堆是分配对象存储的唯一选择么？</font>

如果某些方法中的对象引用没有被返回或者未被外面使用（也就是未逃逸出去），就可以考虑`栈上分配`对象。

从jdk7开始，默认开启了逃逸分析 `-XX:-DoEscapeaAnalysis`。使用<font color=orchid>逃逸分析</font>。

编译器可以对代码做如下优化：

1. 栈上分配：将堆分配转化为栈分配。如果一个对象在子程序中被分配，要使指向该对象的指针永远不会逃逸，对象可能是栈分配的候选，而不是堆分配。.
2. 同步省略：锁消除；如果一个对象被发现只能从一个线程被访问到，那么对于这个对象的操作可以不考虑同步。
3. 标量替换：-XX:EliminateAllocations 默认开。允许将对象打散成标量分配在栈上；有的对象可能不需要作为一个连续的内存结构存在也可以被访问到，那么对象的部分(或全部)可以不存储在内存。

:question:堆中都是线程共享区域么？

TLAB（Thread Local Allocation Buffer )：对Eden区域进行划分，**JVM为每个线程分配了一个私有缓存区域**。

多线程同时分配内存时，使用TLAB可以避免一系列的非线程安全问题，同时还能够提升内存分配的吞吐量

- 可以通过选项“-XX:UseTLAB”设置是否开启TLAB空间。
- **默认情况下，TLAB空间的内存非常小，仅占有整个Eden空间的1%**。通过选项“-XX:TLABWasteTargetPercent”设置TLAB空间所占用Eden空间的百分比大小。
- **一旦对象在TLAB空间分配内存失败时，JVM就会尝试着通过使用加锁机制确保数据操作的原子性，从而直接在Eden空间中分配内存。**



Java 堆是垃圾收集器管理的主要区域，因此也被称作 **GC 堆（Garbage Collected Heap）**。从垃圾回收的角度，由于现在收集器基本都采用分代垃圾收集算法，所以 Java 堆还可以细分为：新生代和老年代；划分的目的是更好地回收内存，或者更快地分配内存。

堆这里最容易出现的就是 `OutOfMemoryError` 错误，并且出现这种错误之后的表现形式还会有几种，比如：

1. `OutOfMemoryError: GC Overhead Limit Exceeded` ： 当 JVM 花太多时间执行垃圾回收并且只能回收很少的堆空间时，就会发生此错误。
2. `OutOfMemoryError: Java heap space` :假如在创建新的对象时, 堆内存中的空间不足以存放新创建的对象, 就会引发此错误。(和配置的最大堆内存有关，且受制于物理内存大小。最大堆内存可通过`-Xmx`参数配置，若没有特别配置，将会使用默认值。

```sh
-Xss 栈空间
-Xms 初始堆 
-Xmx 最大堆
-Xmn 新生代空间大小
SurvivorRatio：设置幸存区的占比
NewRatio：设置新生代与老年代的比例 默认值是2
+useAdaptiveSizePolicy 关闭自适应新生区内存分配策略

查看参数设置：
方式一： 
1.jps
2.jstat -gc 进程id

方式二： 
-XX:+PrintGCDetails 
```



### 方法区

方法区属于是 JVM 运行时数据区域的一块逻辑区域。

当虚拟机要使用一个类时，它需要读取并解析 Class 文件获取相关信息，再将信息存入到方法区。方法区会存储已被虚拟机加载的 **类信息、字段信息、方法信息、常量、静态变量、即时编译器编译后的代码缓存等数据**。

:question:方法区和永久代以及元空间是什么关系呢？

永久代（1.7）和元空间（1.8）是对方法区的不同实现。

![image-20230131170523984](http://images.xyzzs.top/image/image-20230131170523984.png_char)

**为什么要将永久代 (PermGen) 替换为元空间 (MetaSpace) 呢?**

整个永久代有一个 JVM 本身设置的固定大小上限，无法进行调整，而元空间使用的是直接内存，受本机可用内存的限制，虽然元空间仍旧可能溢出，但是比原来出现的几率会更小。

 `-XX：MaxMetaspaceSize` 标志设置最大元空间大小，默认值为 `unlimited`，这意味着它<font color=orchid>只受系统内存的限制</font>。

`-XX：MetaspaceSize` 调整标志定义元空间的初始大小如果未指定此标志，则 Metaspace 将<font color=orchid>根据运行时的应用程序需求动态地重新调整大小</font>。

当元空间溢出时会得到如下错误： `java.lang.OutOfMemoryError: MetaSpace`



栈、堆、方法区的关系

<img src="http://images.xyzzs.top/image/image-20230131191733090.png_char" alt="image-20230131191733090" style="zoom: 80%;" />

### 运行时常量池

Class 文件中除了有类的版本、字段、方法、接口等描述信息外，还有用于存放编译期生成的各种字面量（Literal）和符号引用（Symbolic Reference）的 **常量池表(Constant Pool Table)** 。

字面量是源代码中的固定值的表示法，即通过字面我们就能知道其值的含义。字面量包括整数、浮点数和字符串字面量，符号引用包括*类*符号引用、*字段*符号引用、*方法*符号引用和*接口*方法符号引用。

常量池表会在类加载后存放到方法区的运行时常量池中。

运行时常量池的功能类似于传统编程语言的符号表，尽管它包含了比典型符号表更广泛的数据。

既然运行时常量池是方法区的一部分，自然受到方法区内存的限制，当常量池无法再申请到内存时会抛出 `OutOfMemoryError` 错误。

### 字符串常量池

**字符串常量池** 是 JVM 为了提升性能和减少内存消耗针对字符串（String 类）专门开辟的一块区域，主要目的是为了避免字符串的重复创建。

字符串常量池的实现是 `src/hotspot/share/classfile/stringTable.cpp` ,`StringTable` 本质上就是一个`HashSet<String>` ，容量为 `StringTableSize`（可以通过 `-XX:StringTableSize` 参数来设置）。

**`StringTable` 中保存的是字符串对象的引用，字符串对象的引用指向堆中的字符串对象。**



在JDK1.7之前运行时常量池逻辑包含字符串常量池存放在方法区, 此时hotspot虚拟机对方法区的实现为永久代
在JDK1.7 字符串常量池被从方法区拿到了堆中, 这里没有提到运行时常量池,也就是说字符串常量池被单独拿到堆,运行时常量池剩下的东西还在方法区, 也就是hotspot中的永久代
在JDK1.8 hotspot移除了永久代用元空间(Metaspace)取而代之, 这时候字符串常量池还在堆, 运行时常量池还在方法区, 只不过方法区的实现从永久代变成了元空间(Metaspace)

JDK1.7 之前，字符串常量池存放在永久代。JDK1.7 字符串常量池和静态变量从永久代移动了 Java 堆中。

**JDK 1.7 为什么要将字符串常量池移动到堆中？**

主要是因为永久代（方法区实现）的 GC 回收效率太低，只有在整堆收集 (Full GC)的时候才会被执行 GC。Java 程序中通常会有大量的被创建的字符串等待回收，将字符串常量池放到堆中，能够更高效及时地回收字符串内存。

### 直接内存

直接内存并不是虚拟机运行时数据区的一部分，也不是虚拟机规范中定义的内存区域，但是这部分内存也被频繁地使用。而且也可能导致 OutOfMemoryError 错误出现。

JDK1.4 中新加入的 **NIO(New Input/Output) 类**，引入了一种基于**通道（Channel）与缓存区（Buffer）的 I/O 方式，它可以直接使用 Native 函数库直接分配堆外内存，然后通过一个存储在 Java 堆中的 DirectByteBuffer 对象作为这块内存的引用进行操作。这样就能在一些场景中显著提高性能，因为避免了在 Java 堆和 Native 堆之间来回复制数据**。

本机直接内存的分配不会受到 Java 堆的限制，但是，既然是内存就会受到本机总内存大小以及处理器寻址空间的限制。

<mark>详细内存布局</mark>![img](http://images.xyzzs.top/image/1647149843353-12f5ea5b-4f6f-486a-a73e-753e0b4b6084.png_char)



## 类加载器

JVM 中内置了三个重要的 ClassLoader，除了 BootstrapClassLoader 其他类加载器均由 Java 实现且全部继承自`java.lang.ClassLoader`：

1. **BootstrapClassLoader(启动类加载器)** ：最顶层的加载类，由 C++实现，负责加载 `%JAVA_HOME%/lib`目录下的 jar 包和类或者被 `-Xbootclasspath`参数指定的路径中的所有类。
2. **ExtensionClassLoader(扩展类加载器)** ：主要负责加载 `%JAVA_HOME%/lib/ext` 目录下的 jar 包和类，或被 `java.ext.dirs` 系统变量所指定的路径下的 jar 包。
3. **AppClassLoader(应用程序类加载器)** ：面向我们用户的加载器，负责加载当前应用 classpath 下的所有 jar 包和类。

自定义类加载器：如果我们要自定义自己的类加载器，需要继承 `ClassLoader`。

### 双亲委派模型

每一个类都有一个对应它的类加载器。系统中的 ClassLoader 在协同工作的时候会默认使用 **双亲委派模型** 。即在类加载的时候，系统会首先判断当前类是否被加载过。已经被加载的类会直接返回，否则才会尝试加载。加载的时候，首先会把该请求委派给父类加载器的 `loadClass()` 处理，因此所有的请求最终都应该传送到顶层的启动类加载器 `BootstrapClassLoader` 中。当父类加载器无法处理时，才由自己来处理。当父类加载器为 null 时，会使用启动类加载器 `BootstrapClassLoader` 作为父类加载器。

![image-20230131204440152](http://images.xyzzs.top/image/image-20230131204440152.png_char)

`AppClassLoader`的父类加载器为`ExtClassLoader`， `ExtClassLoader`的父类加载器为 null，**null 并不代表`ExtClassLoader`没有父类加载器，而是 `BootstrapClassLoader`** 。

### 双亲委派模型的好处

双亲委派模型保证了 Java 程序的稳定运行，可以避免类的重复加载（JVM 区分不同类的方式不仅仅根据类名，相同的类文件被不同的类加载器加载产生的是两个不同的类），也<font color=orchid>保证了 Java 的核心 API 不被篡改</font>。如果没有使用双亲委派模型，而是每个类加载器加载自己的话就会出现一些问题，比如我们编写一个称为 `java.lang.Object` 类的话，那么程序运行的时候，系统就会出现多个不同的 `Object` 类。

### 不想用双亲委派模型怎么办？

定义加载器的话，需要继承 `ClassLoader` 。如果我们不想打破双亲委派模型，就重写 `ClassLoader` 类中的 `findClass()` 方法即可，无法被父类加载器加载的类最终会通过这个方法被加载。但是，如果想打破双亲委派模型则需要重写 `loadClass()` 方法







## 类加载过程

![image-20230131195337076](http://images.xyzzs.top/image/image-20230131195337076.png_char)

系统加载 Class 类型的文件主要三步：**加载->连接->初始化**。连接过程又可分为三步：**验证->准备->解析**。

### 加载

类加载过程的第一步，主要完成下面 3 件事情：

1. 通过全类名获取定义此类的二进制字节流
2. 将字节流所代表的静态存储结构转换为方法区的运行时数据结构
3. 在内存中生成一个代表该类的 `Class` 对象，作为方法区这些数据的访问入口

虚拟机规范上面这 3 点并不具体，因此是非常灵活的。比如："通过全类名获取定义此类的二进制字节流" 并没有指明具体从哪里获取、怎样获取。比如：比较常见的就是从 `ZIP` 包中读取（日后出现的 `JAR`、`EAR`、`WAR` 格式的基础）、其他文件生成（典型应用就是 `JSP`）等等。

**一个非数组类的加载阶段（加载阶段获取类的二进制字节流的动作）是可控性最强的阶段，这一步我们可以去完成还可以自定义类加载器去控制字节流的获取方式（重写一个类加载器的 `loadClass()` 方法）。数组类型不通过类加载器创建，它由 Java 虚拟机直接创建。**

加载阶段和连接阶段的部分内容是交叉进行的，加载阶段尚未结束，连接阶段可能就已经开始了。

### 验证

<mark>文件格式验证</mark>：<font color=orchid>验证字节流是否符合Class文件格式的规范</font>，例如:是否以0XCAFEBABE开头、主次版本号是否在当前虚拟机的处理范围之内、常量池中的常量是否有不被支持的类型。

<mark>元数据验证</mark>：对字节码描述的信息进行语义分析(注意:对比javac编译阶段的语义分析)，以保证其描述的信息符合Java语言规范的要求，例如: 这个类是否有父类除java.lang.Obiect之外所有类都有父类)、这个类是否被继承了不允许继承的类(被final修饰的类)等

<mark>字节码验证</mark>：最复杂的一个阶段。通过数据流和控制流分析，确定程序语义是合法的、符合逻辑的。比如保证任意时刻操作数栈和指令代码序列都能配合工作。

<mark>符号引用验证：</mark>：确保解析动作能正确执行

### 准备

1. 将（基本数据类型+String）类变量和静态代码块变量声明，存放到方法区，并赋值默认值。
2. 常量使用字面量赋值的，也在此阶段直接赋上字面量的值。

**准备阶段是正式为类变量分配内存并设置类变量初始值的阶段**，这些内存都将在方法区中分配。对于该阶段有以下几点需要注意：

1. 这时候进行内存分配的仅包括类变量（ Class Variables ，即静态变量，被 `static` 关键字修饰的变量，只与类相关，因此被称为类变量），而不包括实例变量。实例变量会在对象实例化时随着对象一块分配在 Java 堆中。
2. 从概念上讲，类变量所使用的内存都应当在 **方法区** 中进行分配。在 JDK 7 及之后，HotSpot 已经把原本放在永久代的字符串常量池、静态变量等移动到堆中，这个时候类变量则会随着 Class 对象一起存放在 Java 堆中。

![image-20230131201155149](http://images.xyzzs.top/image/image-20230131201155149.png_char)

### 解析

解析阶段是虚拟机<font color=orchid>将常量池内的符号引用替换为直接引用</font>的过程。解析动作主要针对类或接口、字段、类方法、接口方法、方法类型、方法句柄和调用限定符 7 类符号引用进行。

符号引用就是一组符号来描述目标，可以是任何字面量。**直接引用**就是直接指向目标的指针、相对偏移量或一个间接定位到目标的句柄。在程序实际运行时，只有符号引用是不够的，举个例子：在程序执行方法时，系统需要明确知道这个方法所在的位置。Java 虚拟机为每个类都准备了一张方法表来存放类中所有的方法。当需要调用一个类的方法的时候，只要知道这个方法在方法表中的偏移量就可以直接调用该方法了。通过解析操作符号引用就可以直接转变为目标方法在类中方法表的位置，从而使得方法可以被调用。

综上，解析阶段是虚拟机将常量池内的符号引用替换为直接引用的过程，也就是得到类或者字段、方法在内存中的指针或者偏移量。

### 初始化

执行clinit构造器，

初始化阶段是<font color=orchid>执行初始化方法</font> `<clinit> ()`方法的过程，<font color=orchid>为类变量的赋值动作和静态代码块中语句合并起来</font>，是类加载的最后一步，这一步 JVM 才开始真正执行类中定义的 Java 程序代码(字节码)。

> 说明： `<clinit> ()`方法是编译之后自动生成的。

对于`<clinit> ()` 方法的调用，虚拟机会自己确保其在多线程环境中的安全性。因为 `<clinit> ()` 方法是带锁线程安全，所以在多线程环境下进行类初始化的话可能会引起多个线程阻塞，并且这种阻塞很难被发现。

对于初始化阶段，虚拟机严格规范了有且只有 5 种情况下，必须对类进行初始化（<font color=orchid>只有主动去使用类才会初始化类</font>）：

1. 当遇到 `new` 、 `getstatic`、`putstatic` 或 `invokestatic` 这 4 条直接码指令时，比如 `new` 一个类，读取一个静态字段(未被 final 修饰)、或调用一个类的静态方法时。 

    一个类，读取一个静态字段(未被 final 修饰)、或调用一个类的静态方法时。 

   - 当 jvm 执行 `new` 指令时会初始化类。即当程序创建一个类的实例对象。
   - 当 jvm 执行 `getstatic` 指令时会初始化类。即程序访问类的静态变量(不是静态常量，常量会被加载到运行时常量池)。
   - 当 jvm 执行 `putstatic` 指令时会初始化类。即程序给类的静态变量赋值。
   - 当 jvm 执行 `invokestatic` 指令时会初始化类。即程序调用类的静态方法。

2. 使用 `java.lang.reflect` 包的方法对类进行反射调用时如 `Class.forname("...")`, `newInstance()` 等等。如果类没初始化，需要触发其初始化。

3. 初始化一个类，如果其父类还未初始化，则先触发该父类的初始化。

4. 当虚拟机启动时，用户需要定义一个要执行的主类 (包含 `main` 方法的那个类)，虚拟机会先初始化这个类。

5. `MethodHandle` 和 `VarHandle` 可以看作是轻量级的反射调用机制，而要想使用这 2 个调用， 就必须先使用 `findStaticVarHandle` 来初始化要调用的类。

### 卸载

卸载类即该类的 Class 对象被 GC。

卸载类需要满足 3 个要求:

1. 该类的所有的实例对象都已被 GC，也就是说堆不存在该类的实例对象。
2. 该类没有在其他任何地方被引用
3. 该类的类加载器的实例已被 GC

所以，在 JVM 生命周期内，由 jvm 自带的类加载器加载的类是不会被卸载的。但是由我们自定义的类加载器加载的类是可能被卸载的。

只要想通一点就好了，jdk 自带的 `BootstrapClassLoader`, `ExtClassLoader`, `AppClassLoader` 负责加载 jdk 提供的类，所以它们(类加载器的实例)肯定不会被回收。而我们自定义的类加载器的实例是可以被回收的，所以使用我们自定义加载器加载的类是可以被卸载掉的



## 类加载器总结

JVM 中内置了三个重要的 ClassLoader，除了 BootstrapClassLoader 其他类加载器均由 Java 实现且全部继承自`java.lang.ClassLoader`：

1. **BootstrapClassLoader(启动类加载器)** ：最顶层的加载类，由 C++实现，负责加载 `%JAVA_HOME%/lib`目录下的 jar 包和类或者被 `-Xbootclasspath`参数指定的路径中的所有类。
2. **ExtensionClassLoader(扩展类加载器)** ：主要负责加载 `%JRE_HOME%/lib/ext` 目录下的 jar 包和类，或被 `java.ext.dirs` 系统变量所指定的路径下的 jar 包。
3. **AppClassLoader(应用程序类加载器)** ：面向我们用户的加载器，负责加载当前应用 classpath 下的所有 jar 包和类。



## 垃圾回收

<mark>GC基本流程：</mark>

1. 多数情况下，对象在新生代中 Eden 区分配。当 Eden 区没有足够空间进行分配时，虚拟机将发起一次 Minor GC
2. Eden区满了后触发Minor GC，如果对象在 Eden 出生并经过第一次 Minor GC 后仍然能够存活，并且能被 Survivor 容纳的话，将被移动到 Survivor 空间（s0 或者 s1）中，并将对象年龄设为 1(Eden 区->Survivor 区后对象的初始年龄变为 1)。
3. 对象在 Survivor 中每熬过一次 MinorGC,年龄就增加 1 岁，当它的年龄增加到一定程度（默认为 15 岁），就会被晋升到老年代中。对象晋升到老年代的年龄阈值，可以通过参数 `-XX:MaxTenuringThreshold` 来设置；不能超过15，因为对象头**用4个比特位存储对象分代年龄**。

> 特殊情况：创建一个特别大的对象，Eden区放不下，先触发YGC/minor GC，如果放得下，还是放Eden；如果仍然放不下，放到老年区，如果老年区还是放不下，先触发fullGC，如仍然放不下，OOM。

<mark>各GC区域</mark>

部分收集 (Partial GC)：

- 新生代收集（Minor GC / Young GC）：只对新生代进行垃圾收集；
- 老年代收集（Major GC / Old GC）：只对老年代进行垃圾收集。需要注意的是 Major GC 在有的语境中也用于指代整堆收集；
- 混合收集（Mixed GC）：对整个新生代和部分老年代进行垃圾收集。

整堆收集 (Full GC)：收集整个 Java 堆和方法区



内存溢出：内存不够了呗

内存泄漏：对象不会再被程序用到了，但是GC又不能回收他们的情况

例子①：单利模式的生命周期和应用程序一样长，它持有对外对象的引用的话，这个外部对象不能被回收

例子②：一些提供close的资源未关闭，数据库连接、网络连接、io连接等必须手动close



TODO

finalization（）方法： GC之前调用

-XX:+HeapDumpOnOutOfMemoryError 堆溢出时出现dump文件



### 垃圾标记阶段

<mark>引用计算算法</mark>

- 只要有任何一个对象引用了A，则A的引用计数器就加1；
- 当引用失效，计数器就减 1；
- 任何时候计数器为 0 的对象就是不可能再被使用的

这个方法实现简单，效率高，但是目前主流的虚拟机中并没有选择这个算法来管理内存，其最主要的原因是<font color=orchid>无法处理对象之间相互循环引用</font>的问题。

<mark>可达性分析算法</mark>

以GC Roots为起点，目标对象直接或间接被引用连接到，则说明还在使用；否则说明此对象是不可用的，需要被回收；

哪些对象可以作为 GC Roots 呢？（可用MAT查看）

- 虚拟机栈中引用的对象
- 本地方法栈中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 所有被同步锁synchronized持有的对象
- Java虚拟机内部的引用

<mark>四种引用—强软弱虚</mark>

- 强引用（StrongReference）

以前我们使用的大部分引用实际上都是强引用，这是使用最普遍的引用，<font color=orchid>垃圾回收器绝不会回收它</font>。当内存空间不足，Java 虚拟机宁愿抛出 OutOfMemoryError 错误，使程序异常终止，也不会靠随意回收具有强引用的对象来解决内存不足问题。

- 软引用（SoftReference）

如果一个对象只具有软引用，在内存空间足够时，垃圾回收器就不会回收它，<font color=orchid>如果内存空间不足了，就会回收这些对象的内存</font>。只要垃圾回收器没有回收它，该对象就可以被程序使用。软引用可用来实现内存敏感的高速缓存。——<font color=orchid>内存不足即回收</font>

软引用可以和一个引用队列（ReferenceQueue）联合使用，如果软引用所引用的对象被垃圾回收，JAVA 虚拟机就会把这个软引用加入到与之关联的引用队列中。

- 弱引用（WeakReference）

在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了只具有弱引用的对象，<font color=orchid>不管当前内存空间足够与否，都会回收它的内存</font>。不过，由于垃圾回收器是一个优先级很低的线程， 因此不一定会很快发现那些只具有弱引用的对象。——<font color=orchid>发现即回收</font>

弱引用可以和一个引用队列（ReferenceQueue）联合使用，如果弱引用所引用的对象被垃圾回收，Java 虚拟机就会把这个弱引用加入到与之关联的引用队列中。

- 虚引用（PhantomReference）

"虚引用"顾名思义，就是形同虚设，与其他几种引用都不同，虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收。

**虚引用主要用来跟踪对象被垃圾回收的活动**。——<font color=orchid>对象回收跟踪</font>

**虚引用与软引用和弱引用的一个区别在于：** 虚引用必须和引用队列（ReferenceQueue）联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。程序可以通过判断引用队列中是否已经加入了虚引用，来了解被引用的对象是否将要被垃圾回收。程序如果发现某个虚引用已经被加入到引用队列，那么就可以在所引用的对象的内存被回收之前采取必要的行动。

特别注意，在程序设计中一般很少使用弱引用与虚引用，使用软引用的情况较多，这是因为**软引用可以加速 JVM 对垃圾内存的回收速度，可以维护系统的运行安全，防止内存溢出（OutOfMemory）等问题的产生**





软引用：内存不足即回收。OOM前对这些对象列入回收范围内进行第二次回收。 通常用于实现内存敏感的缓存

弱引用：发现即回收，只能存活到下次gc前。也适合用于实现内存敏感的缓存。WeakHashMap

虚引用：对象回收跟踪，用于对象回收跟踪，对象回收时会收到一个系统通知。

终结器引用



<mark>如何判断一个常量是废弃常量？</mark>

运行时常量池主要回收的是废弃的常量。那么，我们如何判断一个常量是废弃常量呢？

假如在字符串常量池中存在字符串 "abc"，如果当前没有任何 String 对象引用该字符串常量的话，就说明常量 "abc" 就是废弃常量，如果这时发生内存回收的话而且有必要的话，"abc" 就会被系统清理出常量池了。

### 清除阶段

<mark>标记-清除算法</mark>（Mark - Sweep）

该算法分为分为两个阶段：

- 标记： Collector从引用根节点（GC roots）开始遍历，<font color=orchid>标记所有被引用的</font>对象。一般是在对象的Header中记录为可达对象。
- 清除：Collector对堆内存从头到尾进行线性的遍历，如果发现某个对象在其Header中没有标记为可达对象，则将其回收。

<img src="http://images.xyzzs.top/image/image-20230131223627154.png_char" alt="image-20230131223627154" style="zoom:67%;" />

优点：比较简单

缺点：

- 效率不算高，标记阶段要从根节点出发遍历所有可达对象，清除阶段也遍历了一遍
- 清理出来的空间不连续，产生内存碎片。需要维护空闲列表
- GC时候需要停止整个应用程序，导致用户体验差

:warning: 何为清除?

这里所谓的清除并不是真的置空，而是把需要清除的对象地址保存在空闲的地址列表里。

<mark>复制算法</mark>

将内存分为大小相同的两块，每次使用其中的一块。当这一块的内存使用完后，就将还存活的对象复制到另一块去，然后再把使用的空间一次清理掉。这样就使每次的内存回收都是对内存区间的一半进行回收。

![image-20230131223719812](http://images.xyzzs.top/image/image-20230131223719812.png_char)

优点:

- 没有标记和清除过程，实现简单，运行高效
- 复制过去以后保证空间的连续性，不会出现“碎片”问题

缺点:

- 此算法的缺点也是很明显的，就是需要两倍的内存空间。

如果系统中的垃圾对象很多，那么需要复制的存活对象数量就会很多，这时就不太适用。适用于对象朝生夕死的区域（新生代：你直接报我身份证得了）。

<mark>标记-压缩算法</mark>

根据老年代的特点提出的一种标记算法，标记过程仍然与“标记-清除”算法一样，但后续步骤不是直接对可回收对象回收，而是让所有存活的对象向一端移动，然后直接清理掉端边界以外的内存。

![image-20230131224246094](http://images.xyzzs.top/image/image-20230131224246094.png_char)

优点：

- 消除了标记-清除算法当中，内存区域分散的缺点，我们需要给新对象分配内存时，JVM只需要持有一个内存的起始地址即可。
- 消除了复制算法当中，内存减半的高额代价。

缺点

- 从效率上来说，标记-整理算法要低于复制算法
- 移动对象的同时，如果对象被其他对象引用，则还需要调整引用的地址。
- 移动过程中，需要全程暂停用户应用程序。即:STW

<mark>分代收集算法</mark>

当前虚拟机的垃圾收集都采用分代收集算法，这种算法没有什么新的思想，只是根据对象存活周期的不同将内存分为几块。一般将 java 堆分为新生代和老年代，这样我们就可以根据各个年代的特点选择合适的垃圾收集算法。

**比如在新生代中，每次收集都会有大量对象死去，所以可以选择”复制“算法，只需要付出少量对象的复制成本就可以完成每次垃圾收集。而老年代的对象存活几率是比较高的，而且没有额外的空间对它进行分配担保，所以我们必须选择“标记-清除”或“标记-整理”算法进行垃圾收集**





CMS回收器标记-清理算法，后备使用标记-清理算法





减少单次STW—用户体验更好

增量收集算法（增加频次）：

优点：并发去执行用户线程和垃圾回收线程，低延迟；缺点：频繁切换线程，耗费资源，垃圾回收总成本上升，造成吞吐量下降

分区算法（分成小块）：

将一块打的内存区域分割成多个小块，减少一次gc产生的停顿，降低延迟



## 垃圾回收器

**如果说收集算法是内存回收的方法论，那么垃圾收集器就是内存回收的具体实现。**

虽然我们对各个收集器进行比较，但并非要挑选出一个最好的收集器。因为直到现在为止还没有最好的垃圾收集器出现，更加没有万能的垃圾收集器，**我们能做的就是根据具体应用场景选择适合自己的垃圾收集器**。试想一下：如果有一种四海之内、任何场景下都适用的完美收集器存在，那么我们的 HotSpot 虚拟机就不会实现那么多不同的垃圾收集器了。

<mark>GC性能指标</mark>

- 吞吐量
- 暂停时间

目前标准：<font color=orchid>在最大吞吐量优先的情况下，降低停顿时间</font>。

按效率分：

串行回收器：Serial、Serial old

并行回收器：ParNew、Parallel Scavenge、Parallel old

并发回收器：CMS、G1

按区域分：

新生代收集器: Serial、ParNew、Parallel Scavenge;

老年代收集器: Serial old、Parallel old、CMS:

整堆收集器:G1;



![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1647689365358-b52d60c1-b0c8-4d82-a189-8d331ad03517.png)



### Serial回收器：串行优先

大家看名字就知道这个收集器是一个单线程收集器了。它的 **单线程** 的意义不仅仅意味着它只会使用一条垃圾收集线程去完成垃圾收集工作，更重要的是它在进行垃圾收集工作的时候必须暂停其他所有的工作线程（ **"Stop The World"** ），直到它收集结束。

通常搭配Serial old GC，

`XX:+useSerialGC`：指定年轻代和老年代都使用串行收集器；相当于新生代使用`Serial GC`，且老年代用`Serial old GC`

优点：简单高效 

一般限定单核CPU才适用

新生代采取复制算法，暂停用户线程

老年代采用标记-整理算法，暂停用户线程

### ParNew回收器：并行优先

**ParNew 收集器其实就是 Serial 收集器的多线程版本，除了使用多线程进行垃圾收集外，其余行为（控制参数、收集算法、回收策略等等）和 Serial 收集器完全一样。**

通常搭配CMS GC

`-XX:+UseParNewGC`

`-XX:ParallelGCThreads`

新生代采取复制算法，暂停用户线程

老年代采用标记-整理算法，暂停用户线程

### Parallel Scavenge 回收器：吞吐量优先

搭配parallel Old GC；<font color=orchid>这是 JDK1.8 默认收集器</font>（Parallel Scavenge + Parallel Old）

新生代采用标记-复制算法，老年代采用标记-整理算法。

Parallel Scavenge 收集器也是使用标记-复制算法的多线程收集器，它看上去几乎和 ParNew 都一样。 **那么它有什么特别之处呢？**

**Parallel Scavenge 收集器关注点是吞吐量（高效率的利用 CPU）。CMS 等垃圾收集器的关注点更多的是用户线程的停顿时间（提高用户体验）。所谓吞吐量就是 CPU 中用于运行用户代码的时间与 CPU 总消耗时间的比值。** Parallel Scavenge 收集器提供了很多参数供用户找到最合适的停顿时间或最大吞吐量，如果对于收集器运作不太了解，手工优化存在困难的时候，使用 Parallel Scavenge 收集器配合自适应调节策略，把内存管理优化交给虚拟机去完成也是一个不错的选择。

-XX:+UseParallelGC和-XX:+UseParallelGC：二者互相激活

-XX:ParallelGCThreads：设置年轻代并行收集器的线程数

-XX:MaxGCPauseMillis：设置垃圾收集器最大停顿时间

-XX:GCTimeRatio  =1/（N+1） 设置垃圾收集时间占总时间比例，默认值N 99

-XX:+UseAdaptiveSizePolicy 开启自适应调节模式 

### Serial Old 收集器

**Serial 收集器的老年代版本**，它同样是一个单线程收集器。它主要有两大用途：一种用途是在 JDK1.5 以及以前的版本中与 Parallel Scavenge 收集器搭配使用，另一种用途是作为 CMS 收集器的后备方案。

### Parallel Old 收集器

**Parallel Scavenge 收集器的老年代版本**。使用多线程和“标记-整理”算法。在注重吞吐量以及 CPU 资源的场合，都可以优先考虑 Parallel Scavenge 收集器和 Parallel Old 收集器。



### CMS回收器：低延迟

CMS（Concurrent-Mark-Sweep）收集器是一种以获取最短回收停顿时间为目标的收集器。它非常符合在注重用户体验的应用上使用。

CMS收集器是 HotSpot 虚拟机第一款真正意义上的并发收集器，它第一次实现了让垃圾收集线程与用户线程（基本上）同时工作。

从名字中的**Mark Sweep**这两个词可以看出，CMS 收集器是一种 **“标记-清除”算法**实现的，它的运作过程相比于前面几种垃圾收集器来说更加复杂一些。整个过程分为四个步骤：

- **初始标记：** 暂停所有的其他线程，并记录下直接与 root 相连的对象，速度很快 ；
- **并发标记：** 同时开启 GC 和用户线程，用一个闭包结构去记录可达对象。但在这个阶段结束，这个闭包结构并不能保证包含当前所有的可达对象。因为用户线程可能会不断的更新引用域，所以 GC 线程无法保证可达性分析的实时性。所以这个算法里会跟踪记录这些发生引用更新的地方。
- **重新标记：** 重新标记阶段就是为了修正并发标记期间因为用户程序继续运行而导致标记产生变动的那一部分对象的标记记录，这个阶段的停顿时间一般会比初始标记阶段的时间稍长，远远比并发标记阶段时间短
- **并发清除：** 开启用户线程，同时 GC 线程开始对未标记的区域做清扫。

![image-20230131235614149](http://images.xyzzs.top/image/image-20230131235614149.png_char)

从它的名字就可以看出它是一款优秀的垃圾收集器，主要优点：**并发收集、低停顿**。但是它有下面三个明显的缺点：

- **对 CPU 资源敏感；**
- **无法处理浮动垃圾；**
- **它使用的回收算法-“标记-清除”算法会导致收集结束时会有大量空间碎片产生**





初始阶段：仅仅只是标记出GC roots能直接关联到的对象，会发生STW，速度非常快

并发阶段：从GC roots的直接关联对象开始遍历整个象图的过程，耗时较长，但是不需要停顿用户线程

重新标记：修正并发标记期间，因用户程序继续运动而导致标记产生变得的那一部分非对象的标记记录

并发标记：清理删除标记阶段判断的已经死亡的对象，释放内存空间

-XX:+UseConcMarkSweepGC

-XX:CMSInitiatingOccupanyFraction 设置堆内存使用率的阈值，一旦达到该阈值，便开始进行回收

初始标记-并发标记-重新标记-重置线程

优点：并发收集、低延迟

缺点：会产生内存碎片、对CPU资源非常敏感、无法处理浮动垃圾。



### G1回收器（Garbage First）：区域化分化式

在延迟可控的情况下获得尽可能高的吞吐量

**G1 (Garbage-First) 是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足 GC 停顿时间要求的同时,还具备高吞吐量性能特征.**

被视为 JDK1.7 中 HotSpot 虚拟机的一个重要进化特征。它具备以下特点：

- **并行与并发**：G1 能充分利用 CPU、多核环境下的硬件优势，使用多个 CPU（CPU 或者 CPU 核心）来缩短 Stop-The-World 停顿时间。部分其他收集器原本需要停顿 Java 线程执行的 GC 动作，G1 收集器仍然可以通过并发的方式让 java 程序继续执行。
- **分代收集**：虽然 G1 可以不需要其他收集器配合就能独立管理整个 GC 堆，但是还是保留了分代的概念。
- **空间整合**：与 CMS 的“标记-清理”算法不同，G1 从整体来看是基于“标记-整理”算法实现的收集器；从局部上来看是基于“标记-复制”算法实现的。
- **可预测的停顿**：这是 G1 相对于 CMS 的另一个大优势，降低停顿时间是 G1 和 CMS 共同的关注点，但 G1 除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为 M 毫秒的时间片段内。

G1 收集器的运作大致分为以下几个步骤：

- **初始标记**
- **并发标记**
- **最终标记**
- **筛选回收**

**G1 收集器在后台维护了一个优先列表，每次根据允许的收集时间，优先选择回收价值最大的 Region(这也就是它的名字 Garbage-First 的由来)** 。这种使用 Region 划分内存空间以及有优先级的区域回收方式，保证了 G1 收集器在有限时间内可以尽可能高的收集效率（把内存化整为零）



### ZGC 收集器

与 CMS 中的 ParNew 和 G1 类似，ZGC 也采用标记-复制算法，不过 ZGC 对该算法做了重大改进。

在 ZGC 中出现 Stop The World 的情况会更少！



<!-- https://javaguide.cn/java/jvm/memory-area.html -->