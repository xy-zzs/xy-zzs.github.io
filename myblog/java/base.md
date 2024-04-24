#  基础导航栏

## 为什么说 Java 语言“编译与解释并存”？

我们可以将高级编程语言按照程序的执行方式分为两种：

- **编译型** ：会通过编译器将源代码一次性翻译成可被该平台执行的机器码。一般情况下，编译语言的执行速度比较快，开发效率比较低。

  <font color=orchid>第一次`翻译>记录>执行`，第二次`执行`。对热点代码友好，热点代码直接执行，效率高。</font>

- **解释型** ：会通过解释器一句一句的将代码解释（interpret）为机器代码后再执行。解释型语言开发效率比较快，执行速度比较慢。

  <font color=orchid>第一次`翻译>执行`，第二次再`翻译>执行`。对启动阶段友好，启动快</font>

 `.class->机器码` 时， JVM 类加载器首先加载字节码文件，然后通过解释器逐行解释执行，这种方式的执行速度会相对比较慢。而且，有些方法和代码块是经常需要被调用的(也就是所谓的热点代码)，所以后面引进了 JIT（just-in-time compilation） 编译器，而 JIT 属于运行时编译。当 JIT 编译器完成<font color=orchid>第一次编译后，其会将字节码对应的机器码保存下来</font>，下次可以直接使用。而我们知道，机器码的运行效率肯定是高于 Java 解释器的。这也解释了我们为什么经常会说 **Java 是编译与解释共存的语言** 。

## Java 中只有值传递

程序设计语言将实参传递给方法（或函数）的方式分为两种：

- **值传递** ：方法接收的是实参值的拷贝，会创建副本。
- **引用传递** ：方法接收的直接是实参所引用的对象在堆中的地址，不会创建副本，对形参的修改将影响到实参。

很多程序设计语言（比如 C++、 Pascal )提供了两种参数传递的方式，不过，在 Java 中只有值传递。

对于刚接触 Java 的学习者，应该都会觉得：Java 对引用类型的参数采用的是引用传递，那么看下以下案例：

```java
public class TransmitType {
    public static void main(String[] args) {
        Person zhangsan = new Person("张三");
        Person lisi = new Person("李四");
        swap(zhangsan, lisi);
        System.out.println("xiaoZhang:" + zhangsan.getName());
        System.out.println("xiaoLi:" + lisi.getName());
    }

    public static void swap(Person person1, Person person2) {
        Person temp = person1;
        person1 = person2;
        person2 = temp;
        System.out.println("person1:" + person1.getName());
        System.out.println("person2:" + person2.getName());
    }
}
@Data
@AllArgsConstructor
class Person {
    private String name;
}
```

输出结果：

![image-20230207101853596](http://images.xyzzs.top/image/image-20230207101853596.png_char) 

Java 中将实参传递给方法（或函数）的方式是 **值传递** ：

- 如果参数是基本类型的话，很简单，传递的就是基本类型的字面量值的拷贝，会创建副本。
- 如果参数是引用类型，传递的就是<font color=orchid>实参所引用的对象在堆中地址值的拷贝</font>，同样也会创建副本



## 如何解决浮点数运算的精度丢失问题？

`BigDecimal` 可以实现对浮点数的运算，不会造成精度丢失。通常情况下，大部分需要浮点数精确运算结果的业务场景（比如涉及到钱的场景）都是通过 `BigDecimal` 来做的。



## 什么是 SPI ？

SPI 即 Service Provider Interface ，字面意思就是：“服务提供者的接口”，<font color=orchid>提供一个指定的接口（即扩展框架功能），由开发者去实现这一个接口，自己完成自定义的功能</font>，能够提升程序的扩展性、可维护性，修改或者替换服务实现并不需要修改调用方。

很多框架都使用了 Java 的 SPI 机制，比如：Spring 框架、数据库加载驱动以及 Dubbo 的扩展实现等等。

<mark>SPI 和 API 的区别</mark>

广义上来说它们都属于接口，而且很容易混淆。下面先用图说明一下

![image-20230206222624315](http://images.xyzzs.top/image/image-20230206222624315.png_char)

API ：当<font color=orchid>实现方提供了接口和实现</font>，我们可以通过调用实现方的接口从而拥有实现方给我们提供的能力。

SPI：当<font color=orchid>接口存在于调用方这边时，由接口调用方确定接口规则</font>，然后由不同的厂商去根据这个规则对这个接口进行实现，从而提供服务。



## 序列化

如果我们需要持久化 Java 对象比如将 Java 对象保存在文件中，或者在网络传输 Java 对象，这些场景都需要用到序列化。

- **序列化**： 将数据结构或对象转换成二进制字节序列的过程
- **反序列化**：将在序列化过程中所生成的二进制字节序列转换成数据结构或者对象的过程

<mark>JDK 自带的序列化方式</mark>

- 使用Serializable接口实现序列化
- 使用 Externalizable 接口实现序列化：继承自 Serializable 接口，需要我们重写`writeExternal()`与`readExternal()`方法

<font color=red>serialVersionUID 有什么作用？</font>

序列化号 `serialVersionUID` 属于版本控制的作用。反序列化时，会检查 `serialVersionUID` 是否和当前类的 `serialVersionUID` 一致。如果 `serialVersionUID` 不一致则会抛出 `InvalidClassException` 异常。

<font color=red>如果有些字段不想进行序列化怎么办？</font>

对于不想进行序列化的变量，可以使用 `transient` 关键字修饰，阻止实例中那些用此关键字修饰的的变量序列化。在被反序列化后，transient 变量的值被设为初始值，如 int 型的是 0，对象型的是 null。

:warning:`static` 变量因为不属于任何对象(Object)，所以无论有没有 `transient` 关键字修饰，均不会被序列化。

<mark>Kryo</mark>

Kryo 是一个高性能的序列化/反序列化工具，由于其变长存储特性并使用了字节码生成机制，拥有较高的运行速度和较小的字节码体积。

另外，Kryo 已经是一种非常成熟的序列化实现了，已经在 Twitter、Groupon、Yahoo 以及多个著名开源项目（如 Hive、Storm）中广泛的使用。

```java
public class KryoSerializer implements Serializer {

    /**
     * Because Kryo is not thread safe. So, use ThreadLocal to store Kryo objects
     */
    private final ThreadLocal<Kryo> kryoThreadLocal = ThreadLocal.withInitial(() -> {
        Kryo kryo = new Kryo();
        kryo.register(RpcResponse.class);
        kryo.register(RpcRequest.class);
        return kryo;
    });

    @Override
    public byte[] serialize(Object obj) {
        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             Output output = new Output(byteArrayOutputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // Object->byte:将对象序列化为byte数组
            kryo.writeObject(output, obj);
            kryoThreadLocal.remove();
            return output.toBytes();
        } catch (Exception e) {
            throw new SerializeException("Serialization failed");
        }
    }

    @Override
    public <T> T deserialize(byte[] bytes, Class<T> clazz) {
        try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);
             Input input = new Input(byteArrayInputStream)) {
            Kryo kryo = kryoThreadLocal.get();
            // byte->Object:从byte数组中反序列化出对象
            Object o = kryo.readObject(input, clazz);
            kryoThreadLocal.remove();
            return clazz.cast(o);
        } catch (Exception e) {
            throw new SerializeException("Deserialization failed");
        }
    }

}
```

<mark>Json</mark>

Json是一种通用和轻量级的数据交换格式，是以<font color=orchid>文本的结构</font>进行存储，是一种简单的消息格式，全称为`JavaScript Object Notation`。Json作为数据包格式传输时具有更高的效率，这是因为Json不像xml那样需要有严格的闭合标签，这就让有效数据量与总数据包比有着显著的提升，从而减少同等数据流量的情况下网络的传输压力！

<mark>Protobuf</mark>

Protobuf是Google开发的一种独立和轻量级的数据交换格式，以<font color=orchid>二进制结构</font>进行存储，用于不同服务之间序列化数据。全称为Protocol Buffers，是一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者序列化，可用于通讯协议、数据存储等领域的语言无关、平台无关、可扩展的序列化结构数据格式。

二进制数据流优点

- 二进制结构存储，效率高，序列化体积比Json和xml更小、更加灵活；
- 格式规范，支持RPC；
- 易于使用，开发人员可以按照一定的语法定义结构化的消息格式，然后送给命令行工具，工具将自动生成相关的类，可以支持JAVA、C++、Go等语言环境。通过这类类包含在项目当中，可以很轻松的调用相关方法来完成业务消息的序列化与反序列工作；

缺点：可读性不高；



## 语法糖

### 枚举

```java
public enum t {
    SPRING,SUMMER;
}
```

反编译后：

```java
public final class T extends Enum
{
    private T(String s, int i)
    {
        super(s, i);
    }
    public static T[] values()
    {
        T at[];
        int i;
        T at1[];
        System.arraycopy(at = ENUM$VALUES, 0, at1 = new T[i = at.length], 0, i);
        return at1;
    }

    public static T valueOf(String s)
    {
        return (T)Enum.valueOf(demo/T, s);
    }

    public static final T SPRING;
    public static final T SUMMER;
    private static final T ENUM$VALUES[];
    static
    {
        SPRING = new T("SPRING", 0);
        SUMMER = new T("SUMMER", 1);
        ENUM$VALUES = (new T[] {
            SPRING, SUMMER
        });
    }
}
```

###  for-each

```java
public static void main(String... args) {
    String[] strs = {"xy", "zzs", "hello"};
    for (String s : strs) {
        System.out.println(s);
    }
    List<String> strList = Arrays.asList("xy","zzs","hello");
    for (String s : strList) {
        System.out.println(s);
    }
}
```

反编译后：

```java
public static transient void main(String args[])
{
    String strs[] = {
        "xy", "zzs", "hello"
    };
    String args1[] = strs;
    int i = args1.length;
    for(int j = 0; j < i; j++)
    {
        String s = args1[j];
        System.out.println(s);
    }

    List strList = Arrays.asList("xy", "zzs", "hello");
    String s;
    for(Iterator iterator = strList.iterator(); iterator.hasNext(); System.out.println(s))
        s = (String)iterator.next();

}
```

:warning:抛出`ConcurrentModificationException`异常。

```java
for (Student stu : students) {
    if (stu.getId() == 2)
        students.remove(stu);
}
```

关键点就在于：调用`list.remove()`方法导致`modCount`和`expectedModCount`的值不一致，后续调用`iterator.hasNext()`会进行检查

```java
public class ArrayList<E> {
    public boolean remove(Object o) {
        if (o == null) {
            for (int index = 0; index < size; index++)
                if (elementData[index] == null) {
                    fastRemove(index);
                    return true;
                }
        } else {
            for (int index = 0; index < size; index++)
                if (o.equals(elementData[index])) {
                    fastRemove(index);
                    return true;
                }
        }
        return false;
    }
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // clear to let GC do its work
    }
}

private class Itr implements Iterator<E> {
    int cursor;       // index of next element to return
    int lastRet = -1; // index of last element returned; -1 if no such
    int expectedModCount = modCount;
    
    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification();//这里会检查
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    public void remove() {
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();

        try {
            ArrayList.this.remove(lastRet);
            cursor = lastRet;
            lastRet = -1;
            expectedModCount = modCount;//更新expectedModCount，所以调用这个remove()可避免
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

单线程的解决方案：

- 使用 Itr 类中也给出的 remove() 方法：因为 Iterator 的 remove 会更新 expectedModCount 的值。

多线程的解决方案：

- 在使用iterator迭代的时候使用synchronized或者Lock进行同步；
- 使用并发容器CopyOnWriteArrayList代替ArrayList和Vector。

### try-with-resource

Java 里，对于文件操作 IO 流、数据库连接等开销非常昂贵的资源，用完之后必须及时通过 close 方法将其关闭，否则资源会一直处于打开状态，可能会导致内存泄露等问题。关闭资源的常用方式就是在`finally`块里是释放，即调用`close`方法。

```java
public static void main(String... args) {
    try (BufferedReader br = new BufferedReader(new FileReader("d:\\ xy.xml"))) {
        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    } catch (IOException e) {
        // handle exception
    }
}
```

反编译后：

```java
public static transient void main(String args[])
    {
        BufferedReader br;
        Throwable throwable;
        br = new BufferedReader(new FileReader("d:\\ xy.xml"));
        throwable = null;
        String line;
        try
        {
            while((line = br.readLine()) != null)
                System.out.println(line);
        }
        catch(Throwable throwable2)
        {
            throwable = throwable2;
            throw throwable2;
        }
        if(br != null)
            if(throwable != null)
                try
                {
                    br.close();
                }
                catch(Throwable throwable1)
                {
                    throwable.addSuppressed(throwable1);
                }
            else
                br.close();
            break MISSING_BLOCK_LABEL_113;
            Exception exception;
            exception;
            if(br != null)
                if(throwable != null)
                    try
                    {
                        br.close();
                    }
                    catch(Throwable throwable3)
                      {
                        throwable.addSuppressed(throwable3);
                    }
                else
                    br.close();
        throw exception;
        IOException ioexception;
        ioexception;
    }
}
```

## 重写equals方法 和 hashcode 方法

未重写前：

== ： 比较内存地址 ，比较new出来两个一样值的对象，那还是是false了 ；

equals： 默认调用的是Object的equals方法，看下面源码图，显然还是使用了== ，那就还是比较内存地址，那肯定是false了；

![img](http://images.xyzzs.top/image/20200803101258865.png_char)

hashCode： 这是根据一定规则例如对象的存储地址，属性值等等映射出来的一个散列值，不同的对象存在可能相等的hashcode，但是概率非常小。

两个对象equals返回true时，hashCode返回肯定是true；而两个对象hashCode返回true时，这两个对象的equals不一定返回true；  还有，如果两个对象的hashCode不一样，那么这两个对象一定不相等）。

<font color=orchid>一个好的散列算法，我们肯定是尽可能让不同对象的hashcode也不同，相同的对象的hashcode也相同。这也是为什么我们比较对象重写equals方法后还会一起重写hashcode方法。</font>

接下来，我们就去实现以上逻辑，先重写equals方法：只要能保证所有属性一致，就返回相等true。代码就不贴了，利用各属性值相等返回即可。

到这步equals方法已经可以根据属性内容是否相等返回对象是否同一个；那么为什么还需要重写hashcode；

- 原因1：为了遵循上述约定，equals返回true时，hashcode返回肯定是true；

- 原因2：为了我们使用HashMap存储对象；HashMap中的比较key：先求出key的hashcode()，比较其值是否相等；若相等再比较equals()，若仍相等则认为他们是相等的。

