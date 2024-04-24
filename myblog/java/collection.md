# 集合导航栏

![image-20230203194621727](http://images.xyzzs.top/image/image-20230203194621727.png_char)

### 集合框架底层数据结构总结

先来看一下 `Collection` 接口下面的集合。

**List**

- `ArrayList`： `Object[]` 数组
- `Vector`：`Object[]` 数组
- `LinkedList`： 双向链表(JDK1.6 之前为循环链表，JDK1.7 取消了循环)

**Set**

- `HashSet`(无序，唯一): 基于 `HashMap` 实现的，底层采用 `HashMap` 来保存元素
- `LinkedHashSet`: `LinkedHashSet` 是 `HashSet` 的子类，并且其内部是通过 `LinkedHashMap` 来实现的。有点类似于我们之前说的 `LinkedHashMap` 其内部是基于 `HashMap` 实现
- `TreeSet`(有序，唯一): 红黑树(自平衡的排序二叉树)

**Queue**

- `PriorityQueue`: `Object[]` 数组来实现二叉堆
- `ArrayQueue`: `Object[]` 数组 + 双指针

再来看看 `Map` 接口下面的集合。

**Map**

- `HashMap`： JDK1.8 之前 `HashMap` 由数组+链表组成的，数组是 `HashMap` 的主体，链表则是主要为了解决哈希冲突而存在的（“拉链法”解决冲突）。JDK1.8 以后在解决哈希冲突时有了较大的变化，当链表长度大于阈值（默认为 8）（将链表转换成红黑树前会判断，如果当前数组的长度小于 64，那么会选择先进行数组扩容，而不是转换为红黑树）时，将链表转化为红黑树，以减少搜索时间
- `LinkedHashMap`： `LinkedHashMap` 继承自 `HashMap`，所以它的底层仍然是基于拉链式散列结构即由数组和链表或红黑树组成。另外，`LinkedHashMap` 在上面结构的基础上，增加了一条双向链表，使得上面的结构可以保持键值对的插入顺序。同时通过对链表进行相应的操作，实现了访问顺序相关逻辑。详细可以查看：[《LinkedHashMap 源码详细分析（JDK1.8）》](https://www.imooc.com/article/22931)

### 如何选用集合?

主要根据集合的特点来选用，比如我们需要根据键值获取到元素值时就选用 `Map` 接口下的集合，需要排序时选择 `TreeMap`,不需要排序时就选择 `HashMap`,需要保证线程安全就选用 `ConcurrentHashMap`。

当我们只需要存放元素值时，就选择实现`Collection` 接口的集合，需要保证元素唯一时选择实现 `Set` 接口的集合比如 `TreeSet` 或 `HashSet`，不需要就选择实现 `List` 接口的比如 `ArrayList` 或 `LinkedList`，然后再根据实现这些接口的集合的特点来选用。

## ArrayList

`ArrayList` 的底层是数组队列，相当于动态数组。与 Java 中的数组相比，它的容量能动态增长。在添加大量元素前，应用程序可以使用`ensureCapacity`操作来增加 `ArrayList` 实例的容量。这可以减少递增式再分配的数量。

`ArrayList`继承于 **`AbstractList`** ，实现了 **`List`**, **`RandomAccess`**, **`Cloneable`**, **`java.io.Serializable`** 这些接口。

- `RandomAccess` 是一个标志接口，表明实现这个接口的 List 集合是支持**快速随机访问**的。在 `ArrayList` 中，我们即可以通过元素的序号快速获取元素对象，这就是快速随机访问。什么是随机访问，[详情查看](https://blog.csdn.net/weixin_43598687/article/details/121617615)。
- `ArrayList` 实现了 **`Cloneable` 接口** ，即覆盖了函数`clone()`，能被克隆。
- `ArrayList` 实现了 `java.io.Serializable`接口，这意味着`ArrayList`支持序列化，能通过序列化去传输

核心源码如下：

```java
public class ArrayList<E> extends AbstractList<E>implements List<E>, RandomAccess, Cloneable, java.io.Serializable{
    private static final long serialVersionUID = 8683452581122892189L;
	//默认初始容量大小
    private static final int DEFAULT_CAPACITY = 10;

    //空数组（用于空实例）。
    private static final Object[] EMPTY_ELEMENTDATA = {};

     //用于默认大小空实例的共享空数组实例。
     //我们把它从EMPTY_ELEMENTDATA数组中区分出来，以知道在添加第一个元素时容量需要增加多少。
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    //保存ArrayList数据的数组
    transient Object[] elementData; // non-private to simplify nested class access

    //ArrayList 所包含的元素个数
    private int size;

    //带初始容量参数的构造函数。（用户自己指定容量）
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            //如果传入的参数大于0，创建initialCapacity大小的数组
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }

    //默认无参构造函数，也就是说初始其实是空数组 当添加第一个元素的时候数组容量才变成10
    public ArrayList() {
        //相当于  Object[] obj = new Object[]{};
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    //ArrayList扩容的核心方法。
    private void grow(int minCapacity) {
        // oldCapacity为旧容量，newCapacity为新容量
        int oldCapacity = elementData.length;
        //将oldCapacity 右移一位，其效果相当于oldCapacity /2，
        //我们知道位运算的速度远远快于整除运算，整句运算式的结果就是将新容量更新为旧容量的1.5倍，
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        //然后检查新容量是否大于最小需要容量，若还是小于最小需要容量，那么就把最小需要容量当作数组的新容量，
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        //再检查新容量是否超出了ArrayList所定义的最大容量，
        //若超出了，则调用hugeCapacity()来比较minCapacity和 MAX_ARRAY_SIZE，
        //如果minCapacity大于MAX_ARRAY_SIZE，则新容量则为Interger.MAX_VALUE，否则，新容量大小则为 MAX_ARRAY_SIZE。
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
    //比较minCapacity和 MAX_ARRAY_SIZE
    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return (minCapacity > MAX_ARRAY_SIZE) ?
            Integer.MAX_VALUE :
            MAX_ARRAY_SIZE;
    }

    /**
     * 将指定的元素追加到此列表的末尾。
     */
    public boolean add(E e) {
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //这里看到ArrayList添加元素的实质就相当于为数组赋值
        elementData[size++] = e;
        return true;
    }

    /**
     * 在此列表中的指定位置插入指定的元素。
     *先调用 rangeCheckForAdd 对index进行界限检查；然后调用 ensureCapacityInternal 方法保证capacity足够大；
     *再将从index开始之后的所有成员后移一个位置；将element插入index位置；最后size加1。
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //arraycopy()这个实现数组之间复制的方法一定要看一下，下面就用到了arraycopy()方法实现数组自己复制自己
        System.arraycopy(elementData, index, elementData, index + 1,
                         size - index);
        elementData[index] = element;
        size++;
    }
}
```

### Arraylist 和 Vector 的区别?

1. `ArrayList` 是 `List` 的主要实现类，底层使用 `Object[ ]`存储，适用于频繁的查找工作，线程不安全 ；
2. `Vector` 是 `List` 的古老实现类，底层使用 `Object[ ]`存储，线程安全的。



## HashMap

### HashMap 的插入流程是怎么样的？

![image-20230202162535098](http://images.xyzzs.top/image/image-20230202162535098.png_char)

### 插入流程的图里刚开始有个计算 key 的 hash 值，是怎么设计的？

源码如下：

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

1. 首先执行`h = key.hashCode()`得到key的哈希值，并赋值给`h`
2. 在执行`(h >>> 16)`，将得到的哈希值右移16位，因为`int`类型是4字节即32位，右移16位，可理解丢弃低16位，将高16位右移过来。
3. 然后将原哈希值和右移后哈希值进行异或运算，得到最终的哈希值。

:question:为什么要让高16位参与运算？

主要是为了在 table 的长度（n）较小的时候，让高位也参与运算，并且不会有太大的开销。

```java
tab[i = (n - 1) & hash]
```

索引位置是通过刚刚的最终哈希值计算得到的，这样就间接使用到了高16位参与索引计算。

### HashMap 的容量必须是 2 的 N 次方，为什么这么设计

核心目的是：实现节点均匀分布，减少 hash 冲突。当 n 不为 2 的 N 次方时，hash 冲突的概率会增大。

计算索引位置的公式为：`(n - 1) & hash`，当 n 为 2 的 N 次方时，n - 1 为低位全是 1 的值，此时任何值跟 n - 1 进行 `&` 与运算的结果为该值的低 N 位，达到了和取模同样的效果，实现了均匀分布。

实际上，这个设计就是基于公式：`x mod 2^n = x & (2^n - 1)`，因为 & 运算比 mod 具有更高的效率。

### 大于等于该容量的最小的2的N次方”是怎么算的？

```java
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

我们先不看`int n = cap - 1`，先看下面的5行计算。

`|=`（或等于）：这个符号比较少见，但是`+=`应该都见过，看到这你应该明白了。例如：a |= b ，可以转成：a = a | b。

![image-20230202155704153](http://images.xyzzs.top/image/image-20230202155704153.png_char)

\>>>（无符号右移）：例如 a >>> b 指的是将 a 向右移动 b 指定的位数，右移后左边空出的位用零来填充，移出右边的位被丢弃。

![image-20230202160244230](http://images.xyzzs.top/image/image-20230202160244230.png_char)

假设 n 的值为 0010 0001，则该计算如下图：

![](http://images.xyzzs.top/image/image-20230202160407700.png_char_char)

可以看出来，这5个公式会通过最高位的1，拿到2个1、4个1、8个1、16个1、32个1。当然，有多少个1，取决于我们的入参有多大，但我们肯定的是经过这5个计算，得到的值是一个低位全是1的值，最后返回的时候 +1，则会得到1个比n 大的 2 的N次方。

核心思想：

1. 将最高位的`1`右边全部变成`1`，比如17（二进制是0001 0001）先执行`n |= n >>> 1`则变成（0001 1001）
2. 接着执行下一行代码`n |= n >>> 2`则变成（0001 1111）
3. `n |= n >>> 4`,`n |= n >>> 8`,`n |= n >>> 16`，也会执行，但是17这个数字比较小，所以不影响结果
4. 检查小于`0`，小于0则设置1；
5. 检查是否达到最大值，若未达到最大值则 `n + 1`变成（0010 0000）即是32

这时再看开头的 cap - 1 就很简单了，这是为了处理 cap 本身就是 2 的N次方的情况。

计算机底层是二进制的，移位和或运算是非常快的，所以这个方法的效率很高。

这操作，看不懂一头雾水，看懂了，只能膜拜作者，这是碳基生物能想的出来的？

### 扩容流程（resize）

![image-20230202164538767](http://images.xyzzs.top/image/image-20230202164538767.png_char)



### 红黑树和链表都是通过 e.hash & oldCap == 0 来定位在新表的索引位置，这是为什么？

因为 2 个节点在老表是同一个索引位置，因此计算新表的索引位置时，只取决于新表在高位多出来的这一位（图中标红），而这一位的值刚好等于 oldCap。

因为只取决于这一位，所以只会存在两种情况：

1. (e.hash & oldCap) == 0 ，则新表索引位置为“原索引位置” ；
2. (e.hash & oldCap) != 0，则新表索引位置为“原索引 + oldCap 位置”。

可以理解为以下的简单数学问题：假设先hash值为27，表的长度为4

1. 此时索引位置在：27 % 4 ==3
2. 发生扩容长度变成8，那么可能在3或（3+4=7）上，实际在27 % 8 == 3（判断条件为是否==3）
3. 发生扩容长度变成16，那么可能在3或（3+8=11）上，实际在27 % 16 == 11（判断条件为是否==3）
4. 发生扩容长度变成32，那么可能在11或（11+16=27）上，实际在27 % 32 == 27（判断条件为是否==11）
5. 继续扩容，依然满足。。。。

### 介绍一下死循环问题

导致死循环的根本原因是 JDK 1.7 扩容采用的是“头插法”，会导致同一索引位置的节点在扩容后顺序反掉，在并发插入触发扩容时形成环，从而产生死循环。

而 JDK 1.8 之后采用的是“尾插法”，扩容后节点顺序不会反掉，不存在死循环问题。



## ConcurrentHashMap

JDK1.7：底层结构为：分段的数组+链表；实现线程安全的方式：分段锁（Segment，继承了ReentrantLock）

JDK1.8：底层结构为：数组+链表+红黑树；实现线程安全的方式：CAS + Synchronized

### ConcurrentHashMap 1.7

![image-20230202201811871](http://images.xyzzs.top/image/image-20230202201811871.png_char)

 Java 7 中 ConcurrnetHashMap 的初始化逻辑。

1. 必要参数校验。
2. 校验并发级别 `concurrencyLevel` 大小，如果大于最大值，重置为最大值。无参构造**默认值是 16.**
3. 寻找并发级别 `concurrencyLevel` 之上最近的 **2 的幂次方**值，作为初始化容量大小，**默认是 16**。
4. 记录 `segmentShift` 偏移量，这个值为【容量 = 2 的N次方】中的 N，在后面 Put 时计算位置时会用到。**默认是 32 - sshift = 28**.
5. 记录 `segmentMask`，默认是 ssize - 1 = 16 -1 = 15.
6. **初始化 `segments[0]`**，**默认大小为 2**，**负载因子 0.75**，**扩容阀值是 2\*0.75=1.5**，插入第二个值时才会进行扩容。



### ConcurrentHashMap 1.8

![image-20230202201848899](http://images.xyzzs.top/image/image-20230202201848899.png_char)

<mark>initTable</mark>

```java
private final Node<K,V>[] initTable() {
        Node<K,V>[] tab; int sc;
        while ((tab = table) == null || tab.length == 0) {
            if ((sc = sizeCtl) < 0)
                Thread.yield(); // lost initialization race; just spin
            else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {	//CAS获取锁
                try {
                    if ((tab = table) == null || tab.length == 0) {
                        int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                        @SuppressWarnings("unchecked")
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = tab = nt;
                        sc = n - (n >>> 2);
                    }
                } finally {
                    sizeCtl = sc;
                }
                break;
            }
        }
        return tab;
    }
```

<mark>put</mark>

1. 根据 key 计算出 hashcode 。
2. 判断是否需要进行初始化。
3. `no lock when adding to empty bin`即为当前 key 定位出的 Node，如果为空表示当前位置可以写入数据，利用 CAS 尝试写入，失败则自旋保证成功。
4. 如果当前位置的 `hashcode == MOVED == -1`,则需要进行扩容。
5. 如果都不满足，则利用 synchronized 锁写入数据。
6. 如果数量大于 `TREEIFY_THRESHOLD` 则要执行树化方法，在 `treeifyBin` 中会首先判断当前数组长度≥64时才会将链表转换为红黑树





### 7和8的区别

1、JDK1.8 中降低锁的粒度。JDK1.7 版本锁的粒度是基于 Segment 的，包含多个节点（HashEntry），而 JDK1.8 锁的粒度就是单节点（Node）。

2、JDK1.8 版本的数据结构变得更加简单，使得操作也更加清晰流畅，因为已经使用 synchronized 来进行同步，所以不需要分段锁的概念，也就不需要 Segment 这种数据结构了，当前还保留仅为了兼容。

3、JDK1.8 使用红黑树来优化链表，跟 HashMap 一样，优化了极端情况下，链表过长带来的性能问题。

4、JDK1.8 使用内置锁 synchronized 来代替重入锁 ReentrantLock，synchronized 是官方一直在不断优化的，现在性能已经比较可观，也是官方推荐使用的加锁方式。
