#  设计模式导航栏

代码下载地址：https://gitee.com/zzsvip/design-pattern.git

## 面向对象设计原则

常⽤的⾯向对象设计原则包括7个，这些原则并不是孤⽴存在的，它们相互依赖，相互补充。

| 设计原则名称                                                 | 定 义                                            | 使用频率 |
| ------------------------------------------------------------ | ------------------------------------------------ | -------- |
| 开闭原则（Open Closed Principle， OCP）                      | 对扩展开放，对修改关闭                           | ★★★★★    |
| 单⼀职责原则（Single Responsibility Principle, SRP）         | ⼀个类只负责⼀个功能领域中的相应职责             | ★★★★☆    |
| ⾥⽒替换原则（Liskov Substitution Principle， LSP）          | 所有引⽤基类的地⽅必须能透明地使⽤其⼦类的对象   | ★★★★★    |
| 依赖倒置原则（Dependency Inversion Principle， DIP）         | 抽象不应该依赖于细节，细节应该依赖于抽象         | ★★★★★    |
| 接⼝隔离原则（Interface Segregation Principle， ISP）        | 使用多个专门的接口，而不使用单一的总接口         | ★★☆☆☆    |
| 合成/聚合复⽤原则（Composite/Aggregate Reuse Principle，C/ARP） | 尽量使⽤合成/聚合，⽽不是通过继承达到复⽤的⽬的  | ★★★★☆    |
| 最少知识原则（Least Knowledge Principle， LKP）或者迪⽶特法则（Law of Demeter， LOD） | ⼀个软件实体应当尽可能少的与其他实体发⽣相互作⽤ | ★★★☆☆    |

## 设计模式的分类

- 创建型

-  在创建对象的同时隐藏创建逻辑，不使⽤ new 直接实例化对象，程序在判断需要创建哪些对象时更灵活。包括⼯⼚/抽象⼯⼚/单例/建造者/原型模式。

- 结构型：

  通过类和接⼝间的继承和引⽤实现创建复杂结构的对象。包括适配器/桥接模式/过滤器/组合/装饰器/外观/享元/代理模式。

- ⾏为型

   通过类之间不同通信⽅式实现不同⾏为。包括责任链/命名/解释器/迭代器/中介者/备忘录/观察者/状态/策略/模板/访问者模式。  

## Spring中设计模式

工厂模式 BeanFactory

装饰器模式 BeanWrapper

代理模式 AopProxy

单例模式 ApplicationContext

委派模式 DispatcherServlet

策略模式 HandlerMapper

适配器模式 HandlerApdapter

模板方法模式 JdbcTemplate

观察者模式 ContextLoaderListener



## 单例模式

单例模式属于创建型模式，⼀个单例类在任何情况下都只存在⼀个实例，构造⽅法必须是私有的、由⾃⼰创建⼀个静态变量存储实例，对外提供⼀
个静态公有⽅法获取实例。
优点是内存中只有⼀个实例，减少了开销，尤其是频繁创建和销毁实例的情况下并且可以避免对资源的多重占⽤。缺点是没有抽象层，难以扩展，
与单⼀职责原则冲突。  

### 饿汉式

可通过<font color=orchid>静态变量或者静态代码</font>块实现

- 优点：简单，线程安全
-  缺点：在类装载的时候就完成实例化，没有达到Lazy Loading的效果。如果从始至终从未使用过这个实例，则会造成内存的浪费

### 懒汉式(线程不安全)

- 优点：起到了Lazy Loading的效果，但是只能在单线程下使用。
- 缺点：线程不安全

### 懒汉式(线程安全，同步方法)

- 优点：解决了线程不安全问题
- 缺点：效率太低

###  双重检查（Double-Check）

- 优点： 懒加载，线程安全，效率较⾼；可以使用这种单例设计模式
-  缺点：对比其他实现有点复杂

:warning:必须搭配 `volatile` 关键字的使⽤。因为 `new` 关键字创建对象不是原⼦操作  ，`volatile` 的特性是保证可⻅性、禁⽌指令重排序  

创建⼀个对象会经历下⾯的步骤：  

1. 在堆内存开辟内存空间
2.  调⽤构造⽅法，初始化对象
3.  引⽤变量指向堆内存空间  

```java
public class DoubleCheck {
    private static volatile DoubleCheck instance;

    public static DoubleCheck getInstance(){
        if (instance == null) {
            synchronized (DoubleCheck.class){
                if (instance == null) {
                    instance = new DoubleCheck();
                }
            }
        }
        return instance;
    }
    private DoubleCheck(){}
}
```

### 静态内部类

这种方式采用了类装载的机制来保证初始化实例时只有一个线程。静态内部类方式在Singleton类被装载时并不会立即实例化，而是在需要实例化
时，调用getInstance方法，才会装载SingletonInstance类，从而完成Singleton的实例化。类的静态属性只会在第一次加载类的时候初始化，所以在这里， JVM帮助我们保证了线程的安全性，在类进行初始化时，别的线程是无法进入的。

- 优点：懒加载，线程安全，效率较⾼，实现简单，推荐使用

```Java
public class LazyStaticInnerClass {
    private static class LazyTest{
        private static final LazyStaticInnerClass INSTANCE = new LazyStaticInnerClass();
    }
    public static LazyStaticInnerClass getInstance(){
        return LazyTest.INSTANCE;
    }
    private LazyStaticInnerClass(){}
}
```

### 枚举

这借助JDK1.5中添加的枚举来实现单例模式。不仅能避免多线程同步问题，而且还能防止反序列化重新创建新的对象。推荐使用

```Java
public class LazyEnum {
    public static void main(String[] args) {
        Singleton instance1 = Singleton.INSTANCE;
        Singleton instance2 = Singleton.INSTANCE;
        System.out.println(instance1 == instance2);
        instance1.sayOK();
    }
}

enum Singleton{
    INSTANCE;
    public void sayOK(){
        System.out.println("OK");
    }
}
```



单例模式注意事项和细节说明

- 单例模式保证了 系统内存中该类只存在一个对象，节省了系统资源，对于一些需要频繁创建销毁的对象，使用单例模式可以提高系统性能
- 当想实例化一个单例类的时候，必须要记住使用相应的获取对象的方法，而不是使用new
-  单例模式使用的场景：需要频繁的进行创建和销毁的对象、创建对象时耗时过多或耗费资源过多(即：重量级对象)， 但又经常用到的对象、工具类对象、频繁访问数据库或文件的对象(比如数据源、 session工厂等)





## 工厂方法

工厂方法模式(Factory Method Pattern)：定义一个用于创建对象的接口，让子类决定将哪一个类实例化。工厂方法模式让一个类的实例化延迟到其子类。工厂方法模式又简称为工厂模式(Factory Pattern)，又可称作虚拟构造器模式(Virtual Constructor Pattern)或多态工厂模式(Polymorphic Factory Pattern)。工厂方法模式是一种类创建型模式。

在工厂方法模式结构图中包含如下几个角色：

   ● Product（抽象产品）：它是定义产品的接口，是工厂方法模式所创建对象的超类型，也就是产品对象的公共父类。

   ● ConcreteProduct（具体产品）：它实现了抽象产品接口，某种类型的具体产品由专门的具体工厂创建，具体工厂和具体产品之间一一对应。

   ● Factory（抽象工厂）：在抽象工厂类中，声明了工厂方法(Factory Method)，用于返回一个产品。抽象工厂是工厂方法模式的核心，所有创建对象的工厂类都必须实现该接口。

   ● ConcreteFactory（具体工厂）：它是抽象工厂类的子类，实现了抽象工厂中定义的工厂方法，并可由客户端调用，返回一个具体产品类的实例。

![img](http://images.xyzzs.top/image/20130712101002890_char)

优点：

1. 用户只需知道具体工厂的名称就可得到所要的产品，无须关心创建过程
2. 在系统增加新的产品时，只需要添加具体产品类和对应的具体工厂类即可，无须对原工厂进行任何修改，满足开闭原则

缺点：

​		每增加一个产品就要增加一个具体产品类和一个对应的具体工厂类，类爆炸，增加了系统的复杂度。

## 抽象工厂

抽象工厂模式(Abstract Factory Pattern)\：提供一个创建一系列相关或相互依赖对象的接口，而无须指定它们具体的类。抽象工厂模式又称为`Kit`模式，它是一种对象创建型模式。

抽象工厂模式为创建一组对象提供了一种解决方案。与工厂方法模式相比，抽象工厂模式中的具体工厂<font color=orchid>不只是创建一种产品，它负责创建一族产品</font>。

在抽象工厂模式结构图中包含如下几个角色：

- AbstractFactory（抽象工厂）：它声明了一组用于创建一族产品的方法，每一个方法对应一种产品。
- ConcreteFactory（具体工厂）：它实现了在抽象工厂中声明的创建产品的方法，生成一组具体产品，这些产品构成了一个产品族，每一个产品都位于某个产品等级结构中。
- AbstractProduct（抽象产品）：它为每种产品声明接口，在抽象产品中声明了产品所具有的业务方法。
- ConcreteProduct（具体产品）：它定义具体工厂生产的具体产品对象，实现抽象产品接口中声明的业务方法。

![img](http://images.xyzzs.top/image/20130713163800203_char)

优点：当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用用一个产品族中的对象。

缺点：当产品族需要增加一个新的产品时，所有的工厂类都需要进行修改。

## 原型模式

原型模式(Prototype  Pattern)：使用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。原型模式是一种对象创建型模式。

在使用原型模式时，我们需要首先创建一个原型对象，再通过复制这个原型对象来创建更多同类型的对象。

在原型模式结构图中包含如下几个角色：

- Prototype（抽象原型类）：它是声明克隆方法的接口，是所有具体原型类的公共父类，可以是抽象类也可以是接口，甚至还可以是具体实现类。
- ConcretePrototype（具体原型类）：它实现在抽象原型类中声明的克隆方法，在克隆方法中返回自己的一个克隆对象。

![image-20230201103511632](http://images.xyzzs.top/image/image-20230201103511632.png_char)

1. Java语言提供的clone()方法：只能实现浅拷贝

```Java
public class Sheep implements Cloneable{

    @Override
    protected Object clone()  {
        Sheep sheep = null;
        try {
            sheep = (Sheep) super.clone();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
            System.out.println("出错"+e.getMessage());
        }
        return sheep;
    }

    private String name;
    private int age;
    private String color;
    public Sheep friend;
    public Sheep getFriend() {
        return friend;
    }
    public void setFriend(Sheep friend) {
        this.friend = friend;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public String getColor() {
        return color;
    }
    public void setColor(String color) {
        this.color = color;
    }
    public Sheep(String name, int age, String color) {
        this.name = name;
        this.age = age;
        this.color = color;
    }
}
```

2. 深拷贝的两种实现方式

   1. 重写`clone()`
   2. 通过对象序列化实现深拷贝

   ```java
   public class DeepProtoType implements Serializable, Cloneable {
   
       public String name;
       public DeepCloneableTarget deepCloneableTarget;
   
       //深拷贝 - 方式1：使用clone方法
       @Override
       protected Object clone() throws CloneNotSupportedException {
   
           Object deep = null;
           deep = super.clone();
   
           //对引用类型的属性，单独处理
           DeepProtoType deepProtoType = (DeepProtoType) deep;
           deepProtoType.deepCloneableTarget = (DeepCloneableTarget)deepCloneableTarget.clone();
           return deepProtoType;
       }
   
       //深拷贝 - 方式2：通过对象序列化实现（推荐）
       public Object deepClone(){
           ByteArrayOutputStream bos = null;
           ObjectOutputStream oos = null;
           ByteArrayInputStream bis = null;
           ObjectInputStream ois = null;
   
           try {
               //序列化
               bos = new ByteArrayOutputStream();
               oos = new ObjectOutputStream(bos);
               oos.writeObject(this);
   
               //反序列化
               bis = new ByteArrayInputStream(bos.toByteArray());
               ois = new ObjectInputStream(bis);
   
               DeepProtoType copy = (DeepProtoType)ois.readObject();
               return copy;
           } catch (Exception e) {
               e.printStackTrace();
               return null;
           } finally {
               try {
                   bos.close();
                   oos.close();
                   bis.close();
                   ois.close();
               } catch (IOException e) {
                   e.printStackTrace();
               }
           }
       }
   
       @Override
       public String toString() {
           return "DeepProtoType{" +
                   "name='" + name + '\'' +
                   ", deepCloneableTarget=" + deepCloneableTarget +
                   '}';
       }
   }
   ```

---

## 适配器模式

配器模式(Adapter Pattern)：将一个接口转换成客户希望的另一个接口，使接口不兼容的那些类可以一起工作，其别名为包装器(Wrapper)。适配器模式既可以作为类结构型模式，也可以作为对象结构型模式。

与电源适配器相似，在适配器模式中引入了一个被称为适配器(Adapter)的包装类，而它所包装的对象称为适配者( Adaptee )，即被适配的类。适配器的实现就是把客户类的请求转化为对适配者的相应接口的调用。
在对象适配器模式结构图中包含如下几个角色：

- Target（目标抽象类）：目标抽象类定义客户所需接口，可以是一个抽象类或接口，也可以是具体类。
- Adapter（适配器类）：适配器可以调用另一个接口，作为一个转换器，对Adaptee和Target进行适配，适配器类是适配器模式的核心，在对象适配器中，它通过继承Target并关联一个Adaptee对象使二者产生联系。
- Adaptee（适配者类）：适配者即被适配的角色，它定义了一个已经存在的接口，这个接口需要适配，适配者类一般是一个具体类，包含了客户希望使用的业务方法，在某些情况下可能没有适配者类的源代码。

<img src="http://images.xyzzs.top/image/image-20230201105730257.png_char" alt="image-20230201105730257" style="zoom:67%;" />



 主要分为三类：类适配器模式、对象适配器模式、接口适配器模式

<mark>类适配器模式</mark>
实现方式： Adapter类，通过继承 src类，实现 dst 类接口，完成src->dst的适配。

<mark>对象适配器模式介绍</mark>

基本思路和类的适配器模式相同，只是将Adapter类作修改，不是继承src类，而是持有src类的实例，以解决兼容性的问题。 即：持有 src类，实现 dst 类接口，完成src->dst的适配。类适配器模式和对象适配器模式最大的区别在于适配器和适配者之间的关系不同，对象适配器模式中适配器和适配者之间是关联关系，而类适配器模式中适配器和适配者是继承关系。
根据`合成复用原则`，在系统中尽量使用关联关系来替代继承关系。
对象适配器模式是适配器模式常用的一种

<mark>接口适配器模式介绍</mark>
 一些书籍称为：适配器模式(Default Adapter Pattern)或缺省适配器模式。
缺省适配器模式(Default Adapter Pattern)：当不需要实现一个接口所提供的所有方法时，可先设计一个抽象类实现该接口，并为接口中每个方法提供一个默认实现（空方法），那么该抽象类的子类可以选择性地覆盖父类的某些方法来实现需求，它适用于不想使用一个接口中的所有方法的情况，又称为单接口适配器模式。

适用于一个接口不想使用其所有的方法的情况。


实际开发中，实现起来不拘泥于讲解的这三种经典形式

## 装饰器模式

装饰模式(Decorator Pattern)：动态地给一个对象增加一些额外的职责，就增加对象功能来说，装饰模式比生成子类实现更为灵活。装饰模式是一种对象结构型模式。

装饰模式可以在不改变一个对象本身功能的基础上给对象增加额外的新行为。装饰模式是一种用于替代继承的技术，它通过一种无须定义子类的方式来给对象动态增加职责，使用对象之间的关联关系取代类之间的继承关系。在装饰模式中引入了装饰类，在装饰类中既可以调用待装饰的原有类的方法，还可以增加新的方法，以扩充原有类的功能。

在装饰模式结构图中包含如下几个角色：

- Component（抽象构件）：它是具体构件和抽象装饰类的共同父类，声明了在具体构件中实现的业务方法，它的引入可以使客户端以一致的方式处理未被装饰的对象以及装饰之后的对象，实现客户端的透明操作。
- ConcreteComponent（具体构件）：它是抽象构件类的子类，用于定义具体的构件对象，实现了在抽象构件中声明的方法，装饰器可以给它增加额外的职责（方法）。
- Decorator（抽象装饰类）：它也是抽象构件类的子类，用于给具体构件增加职责，但是具体职责在其子类中实现。它维护一个指向抽象构件对象的引用，通过该引用可以调用装饰之前构件对象的方法，并通过其子类扩展该方法，以达到装饰的目的。
- ConcreteDecorator（具体装饰类）：它是抽象装饰类的子类，负责向构件添加新的职责。每一个具体装饰类都定义了一些新的行为，它可以调用在抽象装饰类中定义的方法，并可以增加新的方法用以扩充对象的行为。

![image-20230201112229464](http://images.xyzzs.top/image/image-20230201112229464.png_char)

Component与ConcreteComponent之间，如果ConcreteComponent类很多,还可以设计一个缓冲层，将共有的部分提取出来，抽象层一个类。

## 代理模式

代理模式：给某一个对象提供一个代理或占位符，并由代理对象来控制对原对象的访问。

Proxy Pattern: Provide a surrogate or placeholder for another object to control access to it.

代理模式包含如下三个角色

- Subject（抽象主题角色）：它声明了真实主题和代理主题的共同接口，这样一来在任何使用真实主题的地方都可以使用代理主题，客户端通常需要针对抽象主题角色进行编程。
- Proxy（代理主题角色）：它包含了对真实主题的引用，从而可以在任何时候操作真实主题对象；在代理主题角色中提供一个与真实主题角色相同的接口，以便在任何时候都可以替代真实主题；代理主题角色还可以控制对真实主题的使用，负责在需要的时候创建和删除真实主题对象，并对真实主题对象的使用加以约束。通常，在代理主题角色中，客户端在调用所引用的真实主题操作之前或之后还需要执行其他操作，而不仅仅是单纯调用真实主题对象中的操作。
- RealSubject（真实主题角色）：它定义了代理角色所代表的真实对象，在真实主题角色中实现了真实的业务操作，客户端可以通过代理主题角色间接调用真实主题角色中定义的操作。

![image-20230201112948829](http://images.xyzzs.top/image/image-20230201112948829.png_char)

cglib动态代理

```java
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import java.lang.reflect.Method;

public class ProxyFactory implements MethodInterceptor {

    private Object target;

    public ProxyFactory(Object target){
        this.target = target;
    }

    public Object getProxyInstance(){
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(target.getClass());
        enhancer.setCallback(this);
        return enhancer.create();
    }
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("Cglib代理模式开始");
        method.invoke(target,objects);
        System.out.println("Cglib代理模式结束");
        return null;
    }
}
public class TeacherDao {
    public void teach() {
        System.out.println("Cglib代理，不需要实现接口");
    }
}
```

JDK动态代理

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class ProxyFactory {
    private Object target;
    public ProxyFactory(Object target){
        this.target = target;
    }

    public Object getProxyInstance() {
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                target.getClass().getInterfaces(),
                new InvocationHandler() {
                    @Override
                    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                        System.out.println("JDK代理开始");
                        Object invoke = method.invoke(target, args);
                        System.out.println("JDK代理结束");
                        return invoke;
                    }
                });
    }
}

public interface ITeacherDao {
    void teach();
}

public class TeacherDao implements ITeacherDao {
    @Override
    public void teach() {
        System.out.println("被代理对象");
    }
}
```

---

## 模板方法模式

模板方法模式：定义一个操作中算法的框架，而将一些步骤延迟到子类中。模板方法模式使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

Template Method Pattern:  Define the skeleton of an algorithm in an  operation, deferring some steps to subclasses. Template Method lets  subclasses redefine certain steps of an algorithm without changing the  algorithm's structure.

模板方法模式是结构最简单的行为型设计模式，在其结构中只存在父类与子类之间的继承关系。通过使用模板方法模式，可以将一些复杂流程的实现步骤封装在一系列基本方法中，在抽象父类中提供一个称之为模板方法的方法来定义这些基本方法的执行次序，而通过其子类来覆盖某些步骤，从而使得相同的算法框架可以有不同的执行结果。模板方法模式提供了一个模板方法来定义算法框架，而某些具体步骤的实现可以在其子类中完成。
模板方法模式包含如下两个角色：

- AbstractClass（抽象类）：在抽象类中定义了一系列基本操作(PrimitiveOperations)，这些基本操作可以是具体的，也可以是抽象的，每一个基本操作对应算法的一个步骤，在其子类中可以重定义或实现这些步骤。同时，在抽象类中实现了一个模板方法(Template Method)，用于定义一个算法的框架，模板方法不仅可以调用在抽象类中实现的基本方法，也可以调用在抽象类的子类中实现的基本方法，还可以调用其他对象中的方法。
- ConcreteClass（具体子类）：它是抽象类的子类，用于实现在父类中声明的抽象基本操作以完成子类特定算法的步骤，也可以覆盖在父类中已经实现的具体基本操作。

![image-20230201114107184](http://images.xyzzs.top/image/image-20230201114107184.png_char)

<mark>模式实现</mark>
       在实现模板方法模式时，开发抽象类的软件设计师和开发具体子类的软件设计师之间可以进行协作。一个设计师负责给出一个算法的轮廓和框架，另一些设计师则负责给出这个算法的各个逻辑步骤。实现这些具体逻辑步骤的方法即为基本方法，而将这些基本方法汇总起来的方法即为模板方法，模板方法模式的名字也因此而来。下面将详细介绍模板方法和基本方法：

1. 模板方法

   一个模板方法是定义在抽象类中的、把基本操作方法组合在一起形成一个总算法或一个总行为的方法。这个模板方法定义在抽象类中，并由子类不加以修改地完全继承下来。模板方法是一个具体方法，它给出了一个顶层逻辑框架，而逻辑的组成步骤在抽象类中可以是具体方法，也可以是抽象方法。由于模板方法是具体方法，因此模板方法模式中的抽象层只能是抽象类，而不是接口。

2. 基本方法

   基本方法是实现算法各个步骤的方法，是模板方法的组成部分。基本方法又可以分为三种：抽象方法(Abstract Method)、具体方法(Concrete Method)和钩方法(Hook Method)。

   - 抽象方法：一个抽象方法由抽象类声明、由其具体子类实现。在C#语言里一个抽象方法以abstract关键字标识。

   - 具体方法：一个具体方法由一个抽象类或具体类声明并实现，其子类可以进行覆盖也可以直接继承。

   - 钩子方法：一个钩子方法由一个抽象类或具体类声明并实现，而其子类可能会加以扩展。通常在父类中给出的实现是一个空实现（可使用virtual关键字将其定义为虚函数），并以该空实现作为方法的默认实现，当然钩子方法也可以提供一个非空的默认实现。在模板方法模式中，钩子方法有两类：

     ​	第一类钩子方法可以与一些具体步骤 挂钩，以实现在不同条件下执行模板方法中的不同步骤，这类钩子方法的返回类型通常是bool类型的，这类方法名一般为IsXXX()，用于对某个条件进行判断

     ​	还有一类钩子方法就是实现体为空的具体方法，子类可以根据需要覆盖或者继承这些钩子方法，与抽象方法相比，这类钩子方法的好处在于子类如果没有覆盖父类中定义的钩子方法，编译可以正常通过，但是如果没有覆盖父类中声明的抽象方法，编译将报错。

   在模板方法模式中，由于面向对象的多态性，子类对象在运行时将覆盖父类对象，子类中定义的方法也将覆盖父类中定义的方法，因此程序在运行时，具体子类的基本方法将覆盖父类中定义的基本方法，子类的钩子方法也将覆盖父类的钩子方法，从而可以**通过在子类中实现的钩子方法对父类方法的执行进行约束，实现子类对父类行为的反向控制**。

## 观察者模式

观察者模式(Observer Pattern)：定义对象之间的一对多依赖关系，使得每当一个对象状态发生改变时，其相关依赖对象皆得到通知并被自动更新。观察者模式的别名包括发布-订阅（Publish/Subscribe）模式、模型-视图（Model/View）模式、源-监听器（Source/Listener）模式或从属者（Dependents）模式。观察者模式是一种对象行为型模式。
观察者模式用于建立一种对象与对象之间的依赖关系，一个对象发生改变时将自动通知其他对象，其他对象将相应作出反应。<font color=orchid>在观察者模式中，发生改变的对象称为观察目标，而被通知的对象称为观察者</font>，一个观察目标可以对应多个观察者，而且这些观察者之间可以没有任何相互联系，可以根据需要增加和删除观察者，使得系统更易于扩展。
在观察者模式结构图中包含如下几个角色：

- Subject（目标）：目标又称为主题，它是指被观察的对象。在目标中定义了一个观察者集合，一个观察目标可以接受任意数量的观察者来观察，它提供一系列方法来增加和删除观察者对象，同时它定义了通知方法notify()。目标类可以是接口，也可以是抽象类或具体类。
- ConcreteSubject（具体目标）：具体目标是目标类的子类，通常它包含有经常发生改变的数据，当它的状态发生改变时，向它的各个观察者发出通知；同时它还实现了在目标类中定义的抽象业务逻辑方法（如果有的话）。如果无须扩展目标类，则具体目标类可以省略。
- Observer（观察者）：观察者将对观察目标的改变做出反应，观察者一般定义为接口，该接口声明了更新数据的方法update()，因此又称为抽象观察者。
- ConcreteObserver（具体观察者）：在具体观察者中维护一个指向具体目标对象的引用，它存储具体观察者的有关状态，这些状态需要和具体目标的状态保持一致；它实现了在抽象观察者Observer中定义的update()方法。通常在实现时，可以调用具体目标类的attach()方法将自己添加到目标类的集合中或通过detach()方法将自己从目标类的集合中删除。

![image-20230201124601381](http://images.xyzzs.top/image/image-20230201124601381.png_char)

观察者模式在Java语言中的地位非常重要。在JDK的java.util包中，提供了`Observable`类以及`Observer`接口，它们构成了JDK对观察者模式的支持。

我们可以直接使用Observer接口（充当抽象观察者）和Observable类（充当观察目标）来作为观察者模式的抽象层，再自定义具体观察者类和具体观察目标类，通过使用JDK中的Observer接口和Observable类，可以更加方便地在Java语言中应用观察者模式。

![image-20230201125059265](http://images.xyzzs.top/image/image-20230201125059265.png_char)

## 策略模式

策略模式(Strategy Pattern)：定义一系列算法类，将每一个算法封装起来，并让它们可以相互替换，策略模式让算法独立于使用它的客户而变化，也称为政策模式(Policy)。策略模式是一种对象行为型模式。

在策略模式中，我们可以定义一些独立的类来封装不同的算法，为了保证这些策略在使用时具有一致性，一般会提供一个抽象的策略类来做规则的定义，而每种算法则对应于一个具体策略类。

策略模式的主要目的是<font color=orchid>将算法的定义与使用分开</font>，也就是将算法的<font color=orchid>行为和环境</font>分开，将算法的定义放在专门的策略类中，每一个策略类封装了一种实现算法，使用算法的环境类针对抽象策略类进行编程，符合`依赖倒转原则`。**策略模式提供了一种可插入式(Pluggable)算法的实现方案**。在出现新的算法时，只需要增加一个新的实现了抽象策略类的具体策略类即可。

在策略模式结构图中包含如下几个角色：

- Context（环境类）：环境类是使用算法的角色，它在解决某个问题（即实现某个方法）时可以采用多种策略。在环境类中维持一个对抽象策略类的引用实例，用于定义所采用的策略。
- Strategy（抽象策略类）：它为所支持的算法声明了抽象方法，是所有策略类的父类，它可以是抽象类或具体类，也可以是接口。环境类通过抽象策略类中声明的方法在运行时调用具体策略类中实现的算法。
- ConcreteStrategy（具体策略类）：它实现了在抽象策略类中声明的算法，在运行时，具体策略类将覆盖在环境类中定义的抽象策略类对象，使用一种具体的算法实现某个业务处理

![image-20230201123343858](http://images.xyzzs.top/image/image-20230201123343858.png_char)

## 职责链模式

职责链模式(Chain of Responsibility Pattern)：避免请求发送者与接收者耦合在一起，让多个对象都有可能接收请求，将这些对象连接成一条链，并且沿着这条链传递请求，直到有对象处理它为止。职责链模式是一种对象行为型模式。

职责链可以是一条直线、一个环或者一个树形结构，最常见的职责链是直线型，即沿着一条单向的链来传递请求。链上的每一个对象都是请求处理者，职责链模式可以将请求的处理者组织成一条链，并让请求沿着链传递，由链上的处理者对请求进行相应的处理，客户端无须关心请求的处理细节以及请求的传递，只需将请求发送到链上即可，实现请求发送者和请求处理者解耦。这使得**系统可以在不影响客户端的情况下动态地重新组织链和分配责任**。

在职责链模式结构图中包含如下几个角色：

- Handler（抽象处理者）：它定义了一个处理请求的接口，一般设计为抽象类，由于不同的具体处理者处理请求的方式不同，因此在其中定义了抽象请求处理方法。因为每一个处理者的下家还是一个处理者，因此在抽象处理者中定义了一个抽象处理者类型的对象（如结构图中的successor），作为其对下家的引用。通过该引用，处理者可以连成一条链。
- ConcreteHandler（具体处理者）：它是抽象处理者的子类，可以处理用户请求，在具体处理者类中实现了抽象处理者中定义的抽象请求处理方法，在处理请求之前需要进行判断，看是否有相应的处理权限，如果可以处理请求就处理它，否则将请求转发给后继者；在具体处理者中可以访问链中下一个对象，以便请求的转发。

![image-20230201131758335](http://images.xyzzs.top/image/image-20230201131758335.png_char_char)

职责链模式的核心在于抽象处理者类的设计，抽象处理者的典型代码如下所示：

```java
public abstract class Approver {
    protected Approver approver;//下一个处理者
    String name;

    public Approver(String name) {
        this.name = name;
    }

    public void setApprover(Approver approver) {
        this.approver = approver;
    }

    //处理审批请求的方法
    public abstract void processRequest(PurchaseRequest purchaseRequest);

}
```

具体处理者是抽象处理者的子类，它具有两大作用：**第一是处理请求**，不同的具体处理者以不同的形式实现抽象请求处理方法processRequest()；**第二是转发请求**，如果该请求超出了当前处理者类的权限，可以将该请求转发给下家。具体处理者类的典型代码如下：

```java
public class DepartmentApprover extends Approver{
    public DepartmentApprover(String name) {
        super(name);
    }
    
    @Override
    public void processRequest(PurchaseRequest purchaseRequest) {
        if (请求满足条件){
            //处理请求
        }else {
            //转发请求
            approver.processRequest(purchaseRequest);
        }
    }
}
```

:warning:需要注意的是**职责链模式并不创建职责链，职责链的创建工作必须由系统的其他部分来完成，一般是在使用该职责链的客户端中创建职责链**。职责链模式降低了请求的发送端和接收端之间的耦合，使多个对象都有机会处理这个请求。





<!-- https://blog.csdn.net/LoveLion/article/details/17517213?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522162449490716780261956705%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=162449490716780261956705&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-2-17517213.first_rank_v2_pc_rank_v29&utm_term=%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F&spm=1018.2226.3001.4187 -->
