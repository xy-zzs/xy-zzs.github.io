#  字节码文件导航栏

## class文件结构

## 字节码指令集与解析指令





## 类的使用

开发人员可以在程序中访问和调用它的静态类成员信息，或用new关键字为其创建对象实例

### 主动使用vs被动使用

主动使用：会去调用clinit方法；

被动使用：不会去调用clinit方法，不会引起类的初始化

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1648275674600-b9a58704-d5ab-47f3-ad6f-3959fda2d79c.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1648277747364-6126bba9-730a-4170-8bda-4fc67609335d.png)

## 类的卸载

方法区的垃圾回收

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1648279847659-43e26efd-c8c7-448d-a551-205383e8bab7.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1648279901827-9282b453-3b9d-4ad3-afd5-654feff3408d.png)

