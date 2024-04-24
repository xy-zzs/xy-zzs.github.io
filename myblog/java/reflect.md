# 反射导航栏



**优点** ： 可以让咱们的代码更加灵活、为各种框架提供开箱即用的功能提供了便利

**缺点** ：让我们在运行时有了分析操作类的能力，这同样也增加了安全问题。比如可以无视泛型参数的安全检查（泛型参数的安全检查发生在编译时）。另外，反射的性能也要稍差点，不过，对于框架来说实际是影响不大的。





获取Class实例的4中方式

```java
//方式一: 调用运行时类的属性
Class clazz1 = Person.class;
System.out.println(clazz1);

//方式二: 通过运行时类的对象, 调用getcLass()
Person p1 = new Person();
Class clazz2 = p1.getClass();
System.out.println(clazz2);

//方式三: 调用CLass的静态方法: forName(string cLassPath)--使用较多
Class clazz3 = Class .forName("com.java.Person");
clazz3 = Class.forName("java.Lang.String");System.out.println(clazz3);
System.out.println(clazz1 == clazz2);
System.out.println(clazz1 == clazz3);

//方式四:使用类的加载器: CLassLoader--了解
ClassLoader classLoader = ReflectionTest.class.getClassLoader();
class clazz4 = classLoader.loadClass( "com.java,Person");
System.out.println(clazz4);
System.out.println(clazz1 == clazz4);
```



创建实例

```JAVA
//要想此方法正常的创建运行时类的对象，要求:1.运行时类必须提供空参的构造器2.空参的构造器的访问权限得够。通常，设置为public。
//在javabean中要求提供一个public的空参构造器。原因:1.便于通过反射，创建运行时类的对象2.便于子类继承此运行时类时，默认调用super()时，保证父类有此构造器
//Class clazz = Person.class;
Object o = clazz.newInstance();
```



获取属性结构

```java
//Class clazz = Person.class;
//获取属性结构
//getFields():获取当前运行时类及其类中声明为public 访问权限的属性
Field[] fields = clazz.getFields();
//getDeclaredFieLds(): 获取当前运行时类中声明的所有属性。(不包含父类中声明的属
Field[]declaredFields = clazz.getDeclaredFields();
for (Field field : fields) {
    //1.权限修饰符
    int modifier = field.getModifiers();
    //2.数据类型
    Class type = field.getType();
    //3.变量名
    String fName = field.getName();
}
```



获取方法结构

```java
//getMethods(): 获取当前运行时类及其所有父类中声明为public限的方法
Method[] methods = clazz .getMethods();
//getDecLaredMethods(): 获取当前运行时类中声明的所有方法。（不包含父类中声明的）
Method[] declaredMetheds = clazz.getDeclaredMethods();
for(Method m : methods){
    //获取方法的注解
    Annotation[] annotations = method.getAnnotations();
    //权限修饰符
    int modifiers = method.getModifiers();
    //返回值类型
    Class<?> returnType = method.getReturnType();
    //方法名
    String name = method.getName();
    //形参列表
    Class<?>[] parameterTypes = method.getParameterTypes();
    if (!(parameterTypes == null && parameterTypes.length == 0)) {
        for (Class<?> parameterType : parameterTypes) {
            //参数类型（java.lang.String）
            String name1 = parameterType.getName();
        }
    }

    //获取抛出的异常
    Class<?>[] exceptionTypes = method.getExceptionTypes();
    if (exceptionTypes.length > 0 ) {
        for (Class<?> exceptionType : exceptionTypes) {
            //参数类型（java.lang.String）
            String name1 = exceptionType.getName();
        }
    }
}
```



获取构造器结构

```java
//getConstructors()：获取当前运行时类中声明为public的构造器
Constructor[] constructors = clazz.getConstructors();
//getDecLaredMethods(): 获取当前运行时类中声明的所有构造器。（不包含父类中声明的）
Constructor[] declaredConstructors = clazz.getDeclaredConstructors();
```



获取父类泛型、接口泛型、所在包、

```java
//获取父类
Class superclass = clazz.getSuperclass();
//获取带泛型父类
Type genericSuperclass = clazz.getGenericSuperclass();
if (genericSuperclass != null){
    ParameterizedType paramType = (ParameterizedType) genericSuperclass;
    //获取泛型类型
    Type[] actualTypeArguments = paramType.getActualTypeArguments();
    String typeName = actualTypeArguments[0].getTypeName();
    String name = ((Class) actualTypeArguments[0]).getName();
}

//获取接口
Class[] interfaces = clazz.getInterfaces();
//获取带泛型接口
Type[] genericInterfaces = clazz.getGenericInterfaces();
//获取所在包
Package aPackage = clazz.getPackage();
```



获取指定名的属性和方法

```java
//获取指定名的属性后赋值--要求类中属性为public
Field id = clazz.getField("id");
id.set(new Person(),100);
//获取指定名的属性后赋值--包含private，
Field name = clazz.getDeclaredField("name");
name.setAccessible(true);
name.set(new Person(),"zs");

//获取指定名的方法后赋值--要求类中属性为public
Method show = clazz.getMethod("show",String.class);
Object hello = show.invoke("hello");
//获取指定名的属性后赋值--包含private
Method show1 = clazz.getDeclaredMethod("show", String.class);
show1.setAccessible(true);
Object hello1 = show1.invoke("hello");
```