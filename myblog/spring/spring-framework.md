#  Spring Framework 导航栏

## IOC

**IoC（Inversion of Control 控制反转）** 是一种设计思想，而不是一个具体的技术实现。IoC 的思想就是将原本在程序中手动创建对象的控制权，交由 Spring 框架来管理。不过， IoC 并非 Spring 特有，在其他语言中也有应用。

在 Spring 中， IoC 容器是 Spring 用来实现 IoC 的载体， IoC 容器实际上就是个 Map（key，value），Map 中存放的是各种对象。

### 什么是 Spring Bean？

简单来说，Bean 代指的就是那些<font color=orchid>被 IoC 容器所管理的对象</font>。

我们需要告诉 IoC 容器帮助我们管理哪些对象，这个是通过配置元数据来定义的。配置元数据可以是 XML 文件、注解或者 Java 配置类。



### Spring Bean 的生命周期

Spring Bean 的生命周期在整个 Spring 中占有很重要的位置，掌握这些可以加深对 Spring 的理解。

Spring 只帮我们管理单例模式 Bean 的**完整**生命周期，对于 prototype 的 bean ，Spring 在创建好交给使用者之后则不会再管理后续的生命周期。

![image-20230201160337683](http://images.xyzzs.top/image/image-20230201160337683.png_char)

- Bean 容器找到配置文件中 Spring Bean 的定义。
- Bean 容器利用 Java Reflection API 创建一个 Bean 的实例。
- 如果涉及到一些属性值 利用 `set()`方法设置一些属性值。
- 如果 Bean 实现了 `BeanNameAware` 接口，调用 `setBeanName()`方法，传入 Bean 的名字。
- 如果 Bean 实现了 `BeanClassLoaderAware` 接口，调用 `setBeanClassLoader()`方法，传入 `ClassLoader`对象的实例。
- 如果 Bean 实现了 `BeanFactoryAware` 接口，调用 `setBeanFactory()`方法，传入 `BeanFactory`对象的实例。
- 与上面的类似，如果实现了其他 `*.Aware`接口，就调用相应的方法。
- 如果有和加载这个 Bean 的 Spring 容器相关的 `BeanPostProcessor` 对象，执行`postProcessBeforeInitialization()` 方法
- 如果 Bean 实现了`InitializingBean`接口，执行`afterPropertiesSet()`方法。
- 如果 Bean 在配置文件中的定义包含 init-method 属性，执行指定的方法。
- 如果有和加载这个 Bean 的 Spring 容器相关的 `BeanPostProcessor` 对象，执行`postProcessAfterInitialization()` 方法
- 当要销毁 Bean 的时候，如果 Bean 实现了 `DisposableBean` 接口，执行 `destroy()` 方法。
- 当要销毁 Bean 的时候，如果 Bean 在配置文件中的定义包含 destroy-method 属性，执行指定的方法。

下图是一个类似的简化版

![image-20230201162748686](http://images.xyzzs.top/image/image-20230201162748686.png_char)



### Spring IoC 的容器构建流程

![image-20230201165919029](http://images.xyzzs.top/image/image-20230201165919029.png_char)



### BeanFactory 和 FactoryBean 的区别

BeanFactory：Spring 容器最核心也是最基础的接口，本质是个工厂类，用于管理 bean 的工厂，最核心的功能是加载 bean，也就是 getBean 方法，通常我们不会直接使用该接口，而是使用其子接口。

FactoryBean：该接口以 bean 样式定义，但是它不是一种普通的 bean，它是个工厂 bean，实现该接口的类可以<font color=orchid>自己定义要创建的 bean 实例</font>，只需要实现它的 getObject 方法即可。

FactoryBean 被广泛应用于 Java 相关的中间件中。一般来说，都是通过 FactoryBean#getObject 来返回一个代理类，当我们触发调用时，会走到代理类中，从而可以在代理类中实现中间件的自定义逻辑，比如：RPC 最核心的几个功能，选址、建立连接、远程调用，还有一些自定义的监控、限流等等。

### BeanFactory 和 ApplicationContext 的区别

BeanFactory：基础 IoC 容器，提供完整的 IoC 服务支持。

ApplicationContext：高级 IoC 容器，BeanFactory 的子接口，在 BeanFactory 的基础上进行扩展。包含 BeanFactory 的所有功能，还提供了其他高级的特性，比如：事件发布、国际化信息支持、统一资源加载策略等。正常情况下，我们都是使用的 ApplicationContext。

### 将一个类声明为 Bean 的注解有哪些?

- `@Controller` : 对应 Spring MVC 控制层，主要用户接受用户请求并调用 Service 层返回数据给前端页面
- `@Service` : 对应服务层，主要涉及一些复杂的逻辑。
- `@Component` ：通用的注解，可标注任意类为 `Spring` 组件。如果一个 Bean 不知道属于哪个层，可以使用`@Component` 注解标注。
- `@Repository` : 对应持久层即 Dao 层，主要用于数据库相关操作。

### @Resource 和 @Autowire 的区别

1、@Resource 和 @Autowired 都可以用来装配 bean

2、@Autowired 默认先按`byType`类型装配，当一个接口存在多个实现类的话，`byType`就不知道该注入哪个了这时会用`变量名`或者`@Qualifier`按`byName`去匹配名称（通常就是首字母小写的类名）；默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false。

```java
public interface UserService { }
class UserServiceImpl1 implements UserService{ }
class UserServiceImpl2 implements UserService{ }

class demo {
    // 报错，byName 和 byType 都无法匹配到 bean
    @Autowired
    private UserService userService;

    // 正确注入 SmsServiceImpl1 对象对应的 bean
    @Autowired
    private UserService userServiceImpl1;


    // 能正确注入  SmsServiceImpl2 对象对应的 bean
    @Autowired
    @Qualifier(value = "userServiceImpl2")
    private UserService userService;
}
```

3、@Resource  属于 JDK 提供的注解，如果指定了 name 或 type，则按指定的进行装配；如果都不指定，则优先按名称装配，当找不到与名称匹配的 bean 时才按照类型进行装配。

### @Component 和 @Bean 的区别是什么？

- `@Component` 注解作用于类，而`@Bean`注解作用于方法。
- `@Component`是通过类路径扫描的方式自动装配bean到IOC容器中的，而`@Bean`是将方法返回值作为bean自动装配到IOC容器中的
- `@Bean` 注解比 `@Component` 注解的自定义性更强，而且很多地方我们只能通过 `@Bean` 注解来注册 bean。比如当我们引用第三方库中的类需要装配到 `Spring`容器时，则只能通过 `@Bean`来实现。



### Spring 怎么解决循环依赖的问题




![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1664287368896-ff7173de-982d-46d1-9011-2baa5ad5754f.png)

循环依赖

一级缓存（单例池）可解决死循环问题

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1664524603867-a23ebe22-c2de-4592-ba02-49e5b216bc7b.png)



第一级缓存：存放已经经历了完整生命周期的Bean周期

第二级缓存：存放正在实例化但属性还未填充的Bean

第三级缓存：存放生成Bean 的工厂

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1664335677021-a80c728b-0ce6-4055-88be-ba98f2db3800.png)

## AOP

```latex
ajc增强:build插件，修改class字节码文件增强
agent增强: VM optine:-javaagent:..... 运行时增强
```

### JDK 动态代理

我们知道，静态代理只能代理一个具体的类，如果要代理一个接口的多个实现的话需要定义不同的代理类。需要解决这个问题就可以用到 JDK 的动态代理。

其中有两个非常核心的类:

- `java.lang.reflect.Proxy`类。
- `java.lang.reflect.InvocationHandler`接口。

`Proxy` 类是用于创建代理对象，而 `InvocationHandler` 接口主要你是来处理执行逻辑。

```java
public class ProxyFactory {
    private Object target;
    public ProxyFactory(Object target){
        this.target = target;
    }

    public Object getProxyInstance() {
        //arg1，类加载器
        //arg2：增强方法所在的类，这个类实现的接口，支持多个接口
        //arg3：实现这个接口 InvocationHandler，创建代理对象，写增强的部分
        return Proxy.newProxyInstance(target.getClass().getClassLoader(),
                target.getClass().getInterfaces(),
                (proxy, method, args) -> {
                    System.out.println("JDK代理开始");
                    Object invoke = method.invoke(target, args);
                    System.out.println("JDK代理结束");
                    return invoke;
                });
    }
}
```

:exclamation:啊这。。。也太强了吧

:thinking:让我对底层如何实现产生了浓厚的兴趣，马上了解一下

JDK动态代理，生成代理类时，并没有经过源码阶段和编译阶段`.java`，而是直接生成字节码文件`.calss`，经过对运行时对象的反编译，手写模拟了核心代码：

```java
public interface MyInvocationHandler {
    Object invoke(Object proxy,Method method,Object[] args) throws InvocationTargetException, IllegalAccessException;
}
public class $Proxy0 implements Foo{
    private MyInvocationHandler myInvocationHandler;

    public $Proxy0(MyInvocationHandler myInvocationHandler) {
        this.myInvocationHandler = myInvocationHandler;
    }

    static  Method foo;
    static  Method bar;
    static {
        try {
            foo = Foo.class.getDeclaredMethod("foo");
            bar = Foo.class.getDeclaredMethod("bar");
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
            throw new NoSuchMethodError(e.getMessage());
        }
    }
    @Override
    public int foo()  {
        try {
//            Method foo = Foo.class.getDeclaredMethod("foo");
            Object invoke = myInvocationHandler.invoke(this,foo, new Object[0]);
            return (int)invoke;
        } catch (RuntimeException | Error e) {
            e.printStackTrace();
            throw e;
        } catch (Throwable throwable){
            throw new UndeclaredThrowableException(throwable);
        }
    }

    @Override
    public void bar()  {
        try {
//            Method bar = Foo.class.getDeclaredMethod("bar");
            myInvocationHandler.invoke(this,bar,new Object[0]);
        } catch (RuntimeException | Error e) {
            e.printStackTrace();
            throw e;
        } catch (Throwable throwable){
            throw new UndeclaredThrowableException(throwable);
        }
    }
}

public interface Foo {
    int foo() throws InvocationTargetException, IllegalAccessException;
    void bar() throws InvocationTargetException, IllegalAccessException;
}
public class Target implements Foo{
    @Override
    public int  foo() {
        System.out.println("foo");
        return 1;
    }

    @Override
    public void bar() {
        System.out.println("bar");
    }
}
```

测试代码如下

```java
public class HandSpringJDK {
    public static void main(String[] args)  {
        $Proxy0 $Proxy0 = new $Proxy0((proxy, method, args1) -> {
            System.out.println("before...");
            Object invoke = method.invoke(new Target(), args1);
            return invoke;
        });
        $Proxy0.foo();
        $Proxy0.bar();

    }
}
```

可以发现，代码可以说是平平无奇，没有什么难理解的。重要的是谁写了这些代码，答案是使用了`ASM`技术，这个技术作用就是在运行期间动态生成字节码文件。

### Cglib动态代理

一种无需目标类实现接口的实现方式，但不能是`final`类，因为需要继承它来实现。代码代码如下：

```java
public class CglibProxyDemo {
    public static void main(String[] args) {

        Target target = new Target();

        Target proxy = (Target) Enhancer.create(Target.class, (MethodInterceptor) (o, method, objects, methodProxy) -> {
            System.out.println("before...");
//            Object invoke = method.invoke(target, objects);         //反射调用
//            Object invoke2 = methodProxy.invoke(target, objects);   //不是采用反射调用，需要目标,spring采用
            Object invoke3 = methodProxy.invokeSuper(o, objects);        //不是采用反射调用。需要代理
            System.out.println("bafter...");
            return invoke3;
        });
        proxy.foo();
    }
}

class Target {

    public void foo() {
        System.out.println("target");
    }
}
```

还是老问题，底层如何实现，请看模拟源码如下：

```java
public class Target {
    public void save(){System.out.println("save");}
    public void save(int i){System.out.println("save(int)");}
    public void save(long l){System.out.println("save(long)");
}
public class Proxy extends Target{

    private MethodInterceptor methodInterceptor;

    public void setMethodInterceptor(MethodInterceptor methodInterceptor) {
        this.methodInterceptor = methodInterceptor;
    }

    static Method save0;
    static Method save1;
    static Method save2;
    static MethodProxy save0Proxy;
    static MethodProxy save1Proxy;
    static MethodProxy save2Proxy;
    static {
        try {
            save0 = Target.class.getMethod("save");
            save1 = Target.class.getMethod("save", int.class);
            save2 = Target.class.getMethod("save", long.class);
            save0Proxy = MethodProxy.create(Target.class,Proxy.class,"()V","save","saveSuper");
            save1Proxy = MethodProxy.create(Target.class,Proxy.class,"(I)V","save","saveSuper");
            save2Proxy = MethodProxy.create(Target.class,Proxy.class,"(J)V","save","saveSuper");
        } catch (NoSuchMethodException e) {
            throw new NoSuchMethodError(e.getMessage());
        }
    }

    //=============带原始功能的方法===========
    public void saveSuper() { super.save(); }
    public void saveSuper(int i) { super.save(i); }
    public void saveSuper(long l) { super.save(l); }

    //=============带增强功能的方法===========
    @Override
    public void save() {
        try {
            methodInterceptor.intercept(this,save0,new Object[0],save0Proxy);
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    @Override
    public void save(int i) {
        try {
            methodInterceptor.intercept(this,save1,new Object[]{i},save1Proxy);
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            throw new UndeclaredThrowableException(throwable);
        }
    }

    @Override
    public void save(long l) {
        try {
            methodInterceptor.intercept(this,save2,new Object[]{l},save2Proxy);
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
} 
```

还有就是如何实现不反射调用，那就调用`intercept()`时返回个目标方法呗，两个类的核心源码如下

```java
public class ProxyFastClass {
    static Signature s0 = new Signature("saveSuper","()V");
    static Signature s1 = new Signature("saveSuper","(I)V");
    static Signature s2 = new Signature("saveSuper","(J)V");

    /**
     * 用下标记录目标方法，避免了反射
     * @param signature
     * @return
     */

    //获取目标方法编号
    public int getIndex(Signature signature){
        if (s0.equals(signature)){
            return 0;
        }else if (s1.equals(signature)){
            return 1;
        }else if (s2.equals(signature)){
            return 2;
        }
        return -1;
    }

    //根据方法编号，正常调用目标对象方法
    public Object invoke(int index,Object proxy, Object[] args){
        if (index == 0){
            ((Proxy)proxy).saveSuper();
            return null;
        }else if (index == 1){
            ((Proxy)proxy).saveSuper((int)args[0]);
            return null;
        }else if (index == 2){
            ((Proxy)proxy).saveSuper((long)args[0]);
            return null;
        }else {
            throw new RuntimeException("无此方法");
        }
    }

    public static void main(String[] args) {
        ProxyFastClass proxyFastClass = new ProxyFastClass();
        int save = proxyFastClass.getIndex(new Signature("saveSuper", "(I)V"));
        System.out.println(save);
        proxyFastClass.invoke(save,new Proxy(),new Object[]{100});
    }
}
```

```java
public class TargetFastClass {
    static Signature s0 = new Signature("save","()V");
    static Signature s1 = new Signature("save","(I)V");
    static Signature s2 = new Signature("save","(J)V");

    /**
     * 用下标记录目标方法，避免了反射
     * @param signature
     * @return
     */

    //获取目标方法编号
    public int getIndex(Signature signature){
        if (s0.equals(signature)){
            return 0;
        }else if (s1.equals(signature)){
            return 1;
        }else if (s2.equals(signature)){
            return 2;
        }
        return -1;
    }

    //根据方法编号，正常调用目标对象方法
    public Object invoke(int index,Object target, Object[] args){
        if (index == 0){
            ((Target)target).save();
            return null;
        }else if (index == 1){
            ((Target)target).save((int)args[0]);
            return null;
        }else if (index == 2){
            ((Target)target).save((long)args[0]);
            return null;
        }else {
            throw new RuntimeException("无此方法");
        }
    }

    public static void main(String[] args) {
        TargetFastClass targetFastClass = new TargetFastClass();
        int save = targetFastClass.getIndex(new Signature("save", "(I)V"));
        System.out.println(save);
        targetFastClass.invoke(save,new Target(),new Object[]{100});
    }
}
```

### JDK 动态代理和 Cglib 代理的区别

1、JDK 动态代理本质上是实现了被代理对象的接口，而 Cglib 本质上是继承了被代理对象，覆盖其中的方法。

2、JDK 动态代理只能对实现了接口的类生成代理，Cglib 则没有这个限制。但是 Cglib 因为使用继承实现，所以 Cglib 无法代理被 final 修饰的方法或类。

3、在调用代理方法上，JDK 是通过反射机制调用，Cglib是通过FastClass 机制直接调用。FastClass 简单的理解，就是使用 index 作为入参，可以直接定位到要调用的方法直接进行调用。

4、在性能上，JDK1.7 之前，由于使用了 FastClass 机制，Cglib 在执行效率上比 JDK 快，但是随着 JDK 动态代理的不断优化，从 JDK 1.7 开始，JDK 动态代理已经明显比 Cglib 更快了。

### Spring 的 AOP 有哪几种创建代理的方式

Spring 中的 AOP 目前支持 JDK 动态代理和 Cglib 代理。

通常来说：如果被代理对象实现了接口，则使用 JDK 动态代理，否则使用 Cglib 代理。另外，也可以通过指定 proxyTargetClass=true 来实现强制走 Cglib 代理。


## Spring事务

### Spring事务传播机制

PROPAGATION_REQUIRED——required需要，没有新建，有加入（默认）

如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入该事务，这是最常见的选择，也是Spring默认的事务传播行为。

当A调用B的时候：如果A中没有事务，B中有事务，那么B会新建一个事务；如果A中也有事务、B中也有事务，那么B会加入到A中去，变成一个事务，这时，要么都成功，要么都失败。（假如A中有2个SQL，B中有两个SQL，那么这四个SQL会变成一个SQL，要么都成功，要么都失败）



PROPAGATION_REQUIRES_NEW——requires_new需要新的，不管有没有，直接创建新事务

创建新事务，无论当前存不存在事务，都创建新事务。

B会新建一个事务，A和B事务互不干扰，他们出现问题回滚的时候，也都只回滚自己的事务；



PROPAGATION_SUPPORTS——supports支持，有则加入，没有就不管了，非事务运行

支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。

如果A中有事务，则B方法的事务加入A事务中，成为一个事务（一起成功，一起失败），如果A中没有事务，那么B就以非事务方式运行（执行完直接提交）；



PROPAGATION_NOT_SUPPORTED——not supported不支持事务，存在就挂起

以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

被调用者B会以非事务方式运行（直接提交），如果当前有事务，也就是A中有事务，A会被挂起（不执行，等待B执行完，返回）；A和B出现异常需要回滚，互不影响



PROPAGATION_MANDATORY——mandatory强制性，有则加入，没有异常

支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

如果A中有事务，则B方法的事务加入A事务中，成为一个事务（一起成功，一起失败）；如果A中没有事务，B中有事务，那么B就直接抛异常了，意思是B必须要支持回滚的事务中运行



PROPAGATION_NEVER——never不支持事务，存在就异常

以非事务方式执行，如果当前存在事务，则抛出异常。

A中不能有事务，如果没有，B就以非事务方式执行，如果A存在事务，那么直接抛异常



PROPAGATION_NESTED——nested存在就在嵌套的执行，没有就找是否存在外面的事务，有则加入，没有则新建

如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则按REQUIRED属性执行。

如果A中没有事务，那么B创建一个事务执行，如果A中也有事务，那么B会会把事务嵌套在里面。

**对事务要求程度可以从大到小排序：mandatory / supports / required / requires_new / nested / not supported / never**



### Spring 的事务隔离级别是如何做到和数据库不一致的？（5分）

比如数据库是可重复读，Spring 是读已提交，这是怎么实现的？

Spring 的事务隔离级别本质上还是通过数据库来控制的，具体是在执行事务前先执行命令修改数据库隔离级别，命令格式如下：

```mysql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED
```



### spring事物什么时候会失效

spring事物原理是AOP

1.发生自调用

2.方法不是public

3.数据库不支持事物

4.没有被Spring管理

5.异常被吃掉，事物不会回滚





<!-- https://blog.csdn.net/v123411739/article/details/110009966 -->
