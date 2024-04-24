# 操作系统导航栏

# 第一章

## 操作系统的概念、功能和目标

## 操作系统的特征

### 并发和共享的关系

互为存在条件

### 虚拟

空分复用技术

时分复用技术

没有并发和共享，虚拟就没有意义

### 异步

没有并发和共享，异步就没有意义

## 操作系统的发展和分类

### 手工操作阶段

### 

### 批处理阶段

### 单批道处理系统

### 

### 多批道操作系统

### 

### 分时操作系统

### 实时操作系统

### 网络操作系统

### 分布式操作系统

### 个人计算机操作系统

## 操作系统的的运行机制与体系结构



## 中断和异常

中断的诞生

中断的概念和作用

中断的分类

- 内中断
- 外中断

外中断的处理过程



## 系统调用

设备管理

文件管理

进程控制

进程通信

内存管理





# 进程-处理机管理

## 2.1

### 进程的定义、组成、组织方式、特征

定义



组成



组织方式



特征

### 进程的状态与转换

创建态 就绪态 运行态 阻塞态 终止态



### 进程控制

原语

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658922312384-232ffcf8-0e80-42de-b581-fa25cbb8e6f8.png)

### 进程通信

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658922286677-f43173ec-a944-499a-90f3-dfde0888bfd2.png)

### 线程概念和多线程模型

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658923248254-a1976581-617e-46d9-958c-2e1a0af9dc40.png)

## 2.2

### 处理机调度的概念、层次

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658924039849-3783d858-6378-400e-9318-e6745b7b3ec1.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658924161239-d7bd9dd5-f4a8-45d9-8469-d0a23b8cb5ea.png)

### 进程调度的时机、切换与过程、方式

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658924915655-3b1361a5-1373-4f6a-9bc3-f9bfdf8626fd.png)

### 调度算法的评价制表

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658925456079-ed7e94b5-96a8-4d54-9840-76ef90d484ff.png)

### FCFS、SJF、HRRN的调度算法

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1658926839915-ed1369f1-82c3-4159-bc11-8315d0544ea9.png)

### 调度算法

时间片轮转调度算法



优先级调度算法



多级反馈队列调度算法





# 内存-存储器管理

1.1

内存的基础知识

内存的管理的概念

覆盖与交换

连续分配管理方式



动态分区分配算法

- 首次适应算法
- 最佳适应算法
- 最坏适应算法
- 邻近适应算法

基本分页存储管理的基本概念



基本地址变换机构



具有快表的地址变换机构



两级页表



基本分段式存储管理方式



段页式管理方式







页面置换算法

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659151970779-a3b2926c-ee69-433e-bd4b-e0a3290331bf.png)

页面分配策略

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659153072307-778a31c4-f9fb-4db6-93ed-85109d6449d4.png)



# 文件管理

## 4.1

### 初识文件管理

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659156907441-8cb48110-9d4a-40f7-8157-cd7d5f40a5fc.png)

### 文件的逻辑结构

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659157147731-b09b9590-7efc-43d1-845f-226a9d6b243e.png)



![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659158107797-c8faee06-5752-4672-b433-55360021abb4.png)



### 文件目录

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659158249810-30560dc5-1fcd-4a12-a498-1d4c23de464b.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659159308681-d3c91b9d-ba70-47be-ad89-59e9be6d7492.png)

### 文件的物理结构

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659159382391-f743ef32-e8bf-4db4-8419-a12e16900f6e.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659160510474-e26c3f81-d044-4b24-b32b-f7c77a681ce9.png)

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659161464122-732997ab-72e1-4c3f-b273-e768970caf2f.png)

### 文件的存储空间管理

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659163364036-c7993571-29d6-446d-ad58-82f65c2fc0c6.png)



### 文件的基本操作

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659165304464-73a3f699-d369-47c1-a506-307e54781d5e.png)

### 文件共享



### 文件保护

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659166221854-0edadce3-7a06-4cb0-b008-c0a91f97d774.png)

### 文件系统的层次结构

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659166644773-e0de71cb-a354-4d2a-a063-4f3ac480cb53.png)

## 4.2

### 磁盘的结构

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659167065513-f197eccc-ef4b-4798-b820-aa6b4aeb14a7.png)

### 磁盘的调度算法

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659168042652-e978c19d-ba11-493b-85f8-a59f570b9f6c.png)

### 减少磁盘延迟的方法

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659168927572-290b921b-4c79-402d-b52f-276eb2ca248e.png)

### 磁盘的管理

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659169527398-3998f333-9c36-422a-a7d7-6903b20665e2.png)

# 设备管理-IO

## 基本概念和分类

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659170209867-3aaf998e-8cfe-4e6a-ac72-7a01d52d0879.png)

## IO控制器

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659170809227-03440cbe-8acf-474e-b55d-06f55cbd2e7d.png)

## IO控制方式



## IO软件层次结构



## IO核心子系统



## 假脱机技术



## 设备的分配与回收

![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1659175319550-fa53bdc5-e4ab-469b-9354-755c6366f03c.png)

## 缓冲区管理