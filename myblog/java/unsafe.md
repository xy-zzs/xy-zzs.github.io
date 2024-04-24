# Unsafe导航栏

`Unsafe` 是位于 `sun.misc` 包下的一个类，主要提供一些用于执行低级别、不安全操作的方法，如<font color=orchid>直接访问系统内存资源、自主管理内存资源等，这些方法在提升 Java 运行效率、增强 Java 语言底层资源操作能力</font>方面起到了很大的作用。但由于 `Unsafe` 类使 Java 语言<font color=orchid>拥有了类似 C 语言指针一样操作内存空间的能力，这无疑也增加了程序发生相关指针问题的风险</font>。在程序中过度、不正确使用 `Unsafe` 类会使得程序出错的概率变大，使得 Java 这种安全的语言变得不再“安全”，因此对 `Unsafe` 的使用一定要慎重。

## 创建Unsafe

直接使用提供 `public static Unsafe getUnsafe()` 方法，发现会`SecurityException`异常。原因是会对调用者的`classLoader`进行检查，判断当前类是否由`Bootstrap classLoader`加载。也就是说，只有启动类加载器加载的类才能够调用 Unsafe 类中的方法，来防止这些方法在不可信的代码中被调用。

**为什么要对 Unsafe 类进行这么谨慎的使用限制呢?**

`Unsafe` 提供的功能过于底层（如直接访问系统内存资源、自主管理内存资源等），安全隐患也比较大，使用不当的话，很容易出现很严重的问题。

**如若想使用 `Unsafe` 这个类的话，应该如何获取其实例呢？**

1、利用反射获得 Unsafe 类中已经实例化完成的单例对象 `theUnsafe` 

```java
private static Unsafe reflectGetUnsafe() {
    try {
        Field field = Unsafe.class.getDeclaredField("theUnsafe");
        field.setAccessible(true);
        return (Unsafe) field.get(null);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
```

2、从`getUnsafe`方法的使用限制条件出发，通过 Java 命令行命令`-Xbootclasspath/a`把调用 Unsafe 相关方法的类 A 所在 jar 包路径追加到默认的 bootstrap 路径中，使得 A 被引导类加载器加载，从而通过`Unsafe.getUnsafe`方法安全的获取 Unsafe 实例。

```sh
java -Xbootclasspath/a: ${path}   // 其中path为调用Unsafe相关方法的类所在jar包路径
```

<mark>Unsafe 功能</mark>

概括的来说，`Unsafe` 类实现功能可以被分为下面 8 类：

1. 内存操作
2. 内存屏障
3. 对象操作
4. 数据操作
5. CAS 操作
6. 线程调度
7. Class 操作
8. 系统信息

## 内存操作

如果你是一个写过 C 或者 C++ 的程序员，一定对内存操作不会陌生，而在 Java 中是不允许直接对内存进行操作的，对象内存的分配和回收都是由 JVM 自己实现的。但是在 `Unsafe` 中，提供的下列接口可以直接进行内存操作：

```java
//分配新的本地空间
public native long allocateMemory(long bytes);
//重新调整内存空间的大小
public native long reallocateMemory(long address, long bytes);
//将内存设置为指定值
public native void setMemory(Object o, long offset, long bytes, byte value);
//内存拷贝
public native void copyMemory(Object srcBase, long srcOffset,Object destBase, long destOffset,long bytes);
//清除内存
public native void freeMemory(long address);
```

```java
private static void memoryTest(Unsafe unsafe) {
    int size = 4;
    long addr = unsafe.allocateMemory(size);//申请 4 字节长度的内存空间
    long addr3 = unsafe.reallocateMemory(addr, size * 2);//申请 8 字节长度的内存空间
    System.out.println("addr: "+addr);
    System.out.println("addr3: "+addr3);
    try {
        unsafe.setMemory(null,addr ,size,(byte)1);
        for (int i = 0; i < 2; i++) {
            //每次拷贝内存地址addr开始的 4 个字节，分别拷贝到以addr3和addr3+4开始的内存空间上：
            unsafe.copyMemory(null,addr,null,addr3+size*i,4);
        }
        System.out.println(unsafe.getInt(addr));
        System.out.println(unsafe.getLong(addr3));
    }finally {
        unsafe.freeMemory(addr);
        unsafe.freeMemory(addr3);
    }
}
```

使用`allocateMemory`方法申请 4 字节长度的内存空间，调用`setMemory`方法向每个字节写入内容为`byte`类型的 1，当使用 Unsafe 调用`getInt`方法时，因为一个`int`型变量占 4 个字节，会一次性读取 4 个字节，组成一个`int`的值，对应的十进制结果为 16843009。

![image-20230207135635608](http://images.xyzzs.top/image/image-20230207135635608.png_char)

调用`reallocateMemory`方法重新分配了一块 8 字节长度的内存空间，通过比较`addr`和`addr3`可以看到和之前申请的内存地址是不同的。在代码中的第二个 for 循环里，调用`copyMemory`方法进行了两次内存的拷贝，每次拷贝内存地址`addr`开始的 4 个字节，分别拷贝到以`addr3`和`addr3+4`开始的内存空间上：

![image-20230207135642445](http://images.xyzzs.top/image/image-20230207135642445.png_char)

拷贝完成后，使用`getLong`方法一次性读取 8 个字节，得到`long`类型的值为 72340172838076673。

需要注意，通过这种方式分配的内存属于 堆外内存 ，是无法进行垃圾回收的，需要我们把这些内存当做一种资源去手动调用`freeMemory`方法进行释放，否则会产生内存泄漏。通用的操作内存方式是在`try`中执行对内存的操作，最终在`finally`块中进行内存的释放。

**为什么要使用堆外内存？**

- 对垃圾回收停顿的改善。由于堆外内存是直接受操作系统管理而不是 JVM，所以当我们使用堆外内存时，即可保持较小的堆内内存规模。从而在 GC 时减少回收停顿对于应用的影响。
- 提升程序 I/O 操作的性能。通常在 I/O 通信过程中，会存在堆内内存到堆外内存的数据拷贝操作，对于需要频繁进行内存间数据拷贝且生命周期较短的暂存数据，都建议存储到堆外内存。

<mark>典型应用</mark>

`DirectByteBuffer` 是 Java 用于实现堆外内存的一个重要类，通常用在通信过程中做缓冲池，如在 Netty、MINA 等 NIO 框架中应用广泛。`DirectByteBuffer` 对于堆外内存的创建、使用、销毁等逻辑均由 Unsafe 提供的堆外内存 API 来实现。



## 内存屏障

编译器和 CPU 会在保证程序输出结果一致的情况下，会对代码进行重排序，从指令优化角度提升性能，导致 CPU 的高速缓存和内存中数据的不一致，而内存屏障（`Memory Barrier`）就是通过<font color=orchid>阻止屏障两边的指令重排序</font>从而避免编译器和硬件的不正确优化情况。

Java8 中，引入了 3 个内存屏障的函数，它屏蔽了操作系统底层的差异，允许在代码中定义、并统一由 JVM 来生成内存屏障指令，来实现内存屏障的功能。

```java
//内存屏障，禁止load操作重排序。屏障前的load操作不能被重排序到屏障后，屏障后的load操作不能被重排序到屏障前
public native void loadFence();
//内存屏障，禁止store操作重排序。屏障前的store操作不能被重排序到屏障后，屏障后的store操作不能被重排序到屏障前
public native void storeFence();
//内存屏障，禁止load、store操作重排序
public native void fullFence();
```

以下面为例，如果在字段上添加了`volatile`关键字，就能够实现字段在多线程下的可见性。基于读内存屏障，我们也能实现相同的功能。注意这里的`flag`是没有被`volatile`修饰的，但是在循环体中加入了`unsafe.loadFence()`，告诉程序`flag`已失效，要去主内存重新读取。



```java
@Getter
class ChangeThread implements Runnable{

    /*volatile*/ boolean flag=false;

    @Override
    public void run() {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("subThread change flag to:" + flag);
        flag = true;
    }
}
public static void main(String[] args) {
    Unsafe unsafe = UnsafeTest.reflectGetUnsafe();
    ChangeThread changeThread = new ChangeThread();
    new Thread(changeThread).start();
    while (true) {
        boolean flag = changeThread.isFlag();
        unsafe.loadFence(); //加入读内存屏障
        if (flag){
            System.out.println("detected flag changed");
            break;
        }
    }
    System.out.println("main thread end");
}
```

可以用图来表示上面的过程：

![image-20230207142714176](http://images.xyzzs.top/image/image-20230207142714176.png_char)





## 对象操作

Unsafe 提供了全部 8 种基础数据类型以及`Object`的`put`和`get`方法，并且所有的`put`方法都可以越过访问权限，直接修改内存中的数据。

基础数据类型和`Object`的读写稍有不同，基础数据类型是直接操作的属性值（`value`），而`Object`的操作则是基于引用值（`reference value`）。

下面是`Object`的读写方法：

```java
//在对象的指定偏移地址 获取 一个对象引用
public native Object getObject(Object o, long offset);
//在对象的指定偏移地址 写入 一个对象引用
public native void putObject(Object o, long offset, Object x);
```

除了对象属性的普通读写外，`Unsafe` 还提供了 **volatile 读写**和**有序写入**方法。`volatile`读写方法包含了全部基础数据类型和`Object`类型，以`int`类型为例：

```java
//在对象的指定偏移地址 读取 一个int值，支持volatile load语义
public native int getIntVolatile(Object o, long offset);
//在对象的指定偏移地址 写入 一个int，支持volatile store语义
public native void putIntVolatile(Object o, long offset, int x);
```

相对于普通读写来说，`volatile`读写具有更高的成本，因为它需要保证可见性和有序性。在执行`get`操作时，会强制从主存中获取属性值，在使用`put`方法设置属性值时，会强制将值更新到主存中，从而保证这些变更对其他线程是可见的。

有序写入的方法有以下三个：

```java
public native void putOrderedObject(Object o, long offset, Object x);
public native void putOrderedInt(Object o, long offset, int x);
public native void putOrderedLong(Object o, long offset, long x);
```

有序写入的成本相对`volatile`较低，因为它只保证写入时的有序性，而不保证可见性，也就是一个线程写入的值不能保证其他线程立即可见。为了解决这里的差异性，需要对内存屏障的知识点再进一步进行补充，首先需要了解两个指令的概念：

- `Load`：将主内存中的数据拷贝到处理器的缓存中
- `Store`：将处理器缓存的数据刷新到主内存中

顺序写入与`volatile`写入的差别在于，在顺序写时加入的内存屏障类型为`StoreStore`类型，而在`volatile`写入时加入的内存屏障是`StoreLoad`类型，如下图所示：

![image-20230207144420391](http://images.xyzzs.top/image/image-20230207144420391.png_char)

在有序写入方法中，使用的是`StoreStore`屏障，该屏障确保`Store1`立刻刷新数据到内存，这一操作先于`Store2`以及后续的存储指令操作。

在`volatile`写入中，使用的是`StoreLoad`屏障，该屏障确保`Store1`立刻刷新数据到内存，这一操作先于`Load2`及后续的装载指令，并且，`StoreLoad`屏障会使该屏障之前的所有内存访问指令和存储指令全部完成之后，才执行该屏障之后的内存访问指令。

综上所述，在上面的三类写入方法中，在写入效率方面，按照`put`、`putOrder`、`putVolatile`的顺序效率逐渐降低。



使用 `Unsafe` 的 `allocateInstance` 方法，允许我们使用非常规的方式进行对象的实例化，测试代码如下

```java
@Data
class A {
    private int b;
    public A(){
        System.out.println("public A()");
        this.b =1;
    }
}
public void objTest() throws Exception{
    A a1=new A();
    System.out.println(a1.getB());
    A a2 = A.class.newInstance();
    System.out.println(a2.getB());
    A a3= (A) unsafe.allocateInstance(A.class);
    System.out.println(a3.getB());
}
```

输出结果如下：![image-20230207150309237](http://images.xyzzs.top/image/image-20230207150309237.png_char)

说明通过`allocateInstance`方法创建对象过程中，不会调用类的构造方法。使用这种方式创建对象时，只用到了`Class`对象，所以说如果想要跳过对象的初始化阶段或者跳过构造器的安全检查，就可以使用这种方法。在上面的例子中，如果将 A 类的构造函数改为`private`类型，将无法通过构造函数和反射创建对象，但`allocateInstance`方法仍然有效。



## 数组操作

#### 介绍

`arrayBaseOffset` 与 `arrayIndexScale` 这两个方法配合起来使用，即可定位数组中每个元素在内存中的位置。

```java
//返回数组中第一个元素的偏移地址
public native int arrayBaseOffset(Class<?> arrayClass);
//返回数组中一个元素占用的大小
public native int arrayIndexScale(Class<?> arrayClass);
```



## CAS操作

我们都知道，CAS 是一条 CPU 的原子指令（cmpxchg 指令），不会造成所谓的数据不一致问题，`Unsafe` 提供的 CAS 方法底层实现即为 CPU 指令 `cmpxchg`。

```java
/**
  * @param o         包含要修改field的对象
  * @param offset    对象中某field的偏移量
  * @param expected  期望值
  * @param update    更新值
  * @return          true | false
  */
public final native boolean compareAndSwapObject(Object o, long offset,  Object expected, Object update);

public final native boolean compareAndSwapInt(Object o, long offset, int expected,int update);

public final native boolean compareAndSwapLong(Object o, long offset, long expected, long update);
```



```java
private volatile int a;
public static void main(String[] args){
    CasTest casTest=new CasTest();
    new Thread(()->{
        for (int i = 1; i < 5; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
    new Thread(()->{
        for (int i = 5 ; i <10 ; i++) {
            casTest.increment(i);
            System.out.print(casTest.a+" ");
        }
    }).start();
}

private void increment(int x){
    while (true){
        try {
            long fieldOffset = unsafe.objectFieldOffset(CasTest.class.getDeclaredField("a"));
            if (unsafe.compareAndSwapInt(this,fieldOffset,x-1,x))
                break;
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }
}
```

运行代码会依次输出：

```text
1 2 3 4 5 6 7 8 9
```

在上面的例子中，使用两个线程去修改`int`型属性`a`的值，并且只有在`a`的值等于传入的参数`x`减一时，才会将`a`的值变为`x`，也就是实现对`a`的加一的操作。流程如下所示：

![image-20230207153336820](http://images.xyzzs.top/image/image-20230207153336820.png_char)

需要注意的是，在调用`compareAndSwapInt`方法后，会直接返回`true`或`false`的修改结果，因此需要我们在代码中手动添加自旋的逻辑。在`AtomicInteger`类的设计中，也是采用了将`compareAndSwapInt`的结果作为循环条件，直至修改成功才退出死循环的方式来实现的原子性的自增操作。



## 线程调度

`Unsafe` 类中提供了`park`、`unpark`、`monitorEnter`、`monitorExit`、`tryMonitorEnter`方法进行线程调度。

```java
//取消阻塞线程
public native void unpark(Object thread);
//阻塞线程
public native void park(boolean isAbsolute, long time);
//获得对象锁（可重入锁）
@Deprecated
public native void monitorEnter(Object o);
//释放对象锁
@Deprecated
public native void monitorExit(Object o);
//尝试获取对象锁
@Deprecated
public native boolean tryMonitorEnter(Object o);
```

方法 `park`、`unpark` 即可实现线程的挂起与恢复，将一个线程进行挂起是通过 `park` 方法实现的，调用 `park` 方法后，线程将一直阻塞直到超时或者中断等条件出现；`unpark` 可以终止一个挂起的线程，使其恢复正常。

此外，`Unsafe` 源码中`monitor`相关的三个方法已经被标记为`deprecated`，不建议被使用。

`monitorEnter`方法用于获得对象锁

`monitorExit`用于释放对象锁，如果对一个没有被`monitorEnter`加锁的对象执行此方法，会抛出`IllegalMonitorStateException`异常。

`tryMonitorEnter`方法尝试获取对象锁，如果成功则返回`true`，反之返回`false`。



典型应用

Java 锁和同步器框架的核心类 `AbstractQueuedSynchronizer` (AQS)，就是通过调用`LockSupport.park()`和`LockSupport.unpark()`实现线程的阻塞和唤醒的，而 `LockSupport` 的 `park` 、`unpark` 方法实际是调用 `Unsafe` 的 `park` 、`unpark` 方式实现的。

## Class操作

`Unsafe` 对`Class`的相关操作主要包括类加载和静态变量的操作方法。

**静态属性读取相关的方法**

```java
//获取静态属性的偏移量
public native long staticFieldOffset(Field f);
//获取静态属性的对象指针
public native Object staticFieldBase(Field f);
//判断类是否需要实例化（用于获取类的静态属性前进行检测）
public native boolean shouldBeInitialized(Class<?> c);
```



```java
@Data
public class User {
    public static String name="xyzzs";
    int age;
}
private void staticTest() throws Exception {
    User user = new User();
    System.out.println(unsafe.shouldBeInitialized(User.class));
    Field sexField = User.class.getDeclaredField("name");
    long fieldOffset = unsafe.staticFieldOffset(sexField);
    Object fieldBase = unsafe.staticFieldBase(sexField);
    Object object = unsafe.getObject(fieldBase, fieldOffset);
    System.out.println(object);
}
```

在 `Unsafe` 的对象操作中，通过`objectFieldOffset`方法获取对象属性偏移量并基于它对变量的值进行存取，但是它不适用于类中的静态属性，这时候就需要使用`staticFieldOffset`方法。在上面的代码中，只有在获取`Field`对象的过程中依赖到了`Class`，而获取静态变量的属性时不再依赖于`Class`。

在上面的代码中首先创建一个`User`对象，这是因为如果一个类没有被实例化，那么它的静态属性也不会被初始化，最后获取的字段属性将是`null`。所以在获取静态属性前，需要调用`shouldBeInitialized`方法，判断在获取前是否需要初始化这个类。



**使用`defineClass`方法允许程序在运行时动态地创建一个类**

```java
public native Class<?> defineClass(String name, byte[] b, int off, int len, ClassLoader loader,
                                   ProtectionDomain protectionDomain);
```

在实际使用过程中，可以只传入字节数组、起始字节的下标以及读取的字节长度，默认情况下，类加载器（`ClassLoader`）和保护域（`ProtectionDomain`）来源于调用此方法的实例。

首先读取了一个`class`文件并通过文件流将它转化为字节数组，之后使用`defineClass`方法动态的创建了一个类，并在后续完成了它的实例化工作，流程如下图所示，并且通过这种方式创建的类，会跳过 JVM 的所有安全检查。

![image-20230207160842866](http://images.xyzzs.top/image/image-20230207160842866.png_char)

除了`defineClass`方法外，Unsafe 还提供了一个`defineAnonymousClass`方法：

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

使用该方法可以用来动态的创建一个匿名类，在`Lambda`表达式中就是使用 ASM 动态生成字节码，然后利用该方法定义实现相应的函数式接口的匿名类。在 JDK 15 发布的新特性中，在隐藏类（`Hidden classes`）一条中，指出将在未来的版本中弃用 `Unsafe` 的`defineAnonymousClass`方法。

## 系统信息

这部分包含两个获取系统相关信息的方法。

```java
//返回系统指针的大小。返回值为4（32位系统）或 8（64位系统）。
public native int addressSize();
//内存页的大小，此值为2的幂次方。
public native int pageSize();
```



总结

相信大家通能够发现 `Unsafe` 在某些场景下，确实能够为我们提供编程中的便利。但是回到开头的话题，在使用这些便利时，确实存在着一些安全上的隐患，在我看来，一项技术具有不安全因素并不可怕，可怕的是它在使用过程中被滥用。尽管之前有传言说会在 Java9 中移除 `Unsafe` 类，不过它还是照样已经存活到了 Java16。按照存在即合理的逻辑，只要使用得当，它还是能给我们带来不少的帮助，因此最后还是建议大家，在使用 `Unsafe` 的过程中一定要做到使用谨慎使用、避免滥用。