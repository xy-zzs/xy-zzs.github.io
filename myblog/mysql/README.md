# MySQL导航栏44

## SQL逻辑架构

![img](http://images.xyzzs.top/image/1651976699636-c776fac8-61d9-402b-8588-a90aa2f094d0.png_char)

### 逻辑架构剖析

发起连接，分配线程处理语句，对接接口，如有缓存直接返回，若无，执行解析器，生成语法树，再到优化器，进行逻辑和物理的优化，调用对应的api查找存储引擎

#### 连接层

系统（客户端）访问 MySQL 服务器前，做的第一件事就是建立 TCP 连接。

经过三次握手建立连接成功后， MySQL 服务器对 TCP 传输过来的账号密码做身份认证、权限获取。

- 用户名或密码不对，会收到一个`Access denied for user`错误，客户端程序结束执行

- 用户名密码认证通过，会从权限表查出账号拥有的权限与连接关联，之后的权限判断逻辑，都将依赖于此时读到的权限

TCP 连接收到请求后，必须要分配给一个线程专门与这个客户端的交互。所以还会有个线程池，去走后

面的流程。每一个连接从线程池中获取线程，省去了创建和销毁线程的开销。

#### 服务层

<font color =red>**SQL Interface** SQL接口</font>

- 接收用户的SQL命令，并且返回用户需要查询的结果。比如SELECT ... FROM就是调用SQL

Interface

- MySQL支持DML（数据操作语言）、DDL（数据定义语言）、存储过程、视图、触发器、自定

义函数等多种SQL语言接口

<font color =red>**Parser**解析器</font>

- 在解析器中对 SQL 语句进行语法分析、语义分析。将SQL语句分解成数据结构，并将这个结构

传递到后续步骤，以后SQL语句的传递和处理就是基于这个结构的。如果在分解构成中遇到错

误，那么就说明这个SQL语句是不合理的。

- 在SQL命令传递到解析器的时候会被解析器验证和解析，并为其创建 语法树 ，并根据数据字

  典丰富查询语法树，会 验证该客户端是否具有执行该查询的权限 。创建好语法树后，MySQL还

  会对SQl查询进行语法上的优化，进行查询重写。

<font color =red>**Optimizer**优化器</font>——核心组件

- SQL语句在语法解析之后、查询之前会使用查询优化器确定 SQL 语句的执行路径，生成一个

执行计划 。

- 这个执行计划表明应该 使用哪些索引 进行查询（全表检索还是使用索引检索），表之间的连

  接顺序如何，最后会按照执行计划中的步骤调用存储引擎提供的方法来真正的执行查询，并将

  查询结果返回给用户

<font color =red>**Caches & Buffers** 查询缓存组件</font>

- MySQL内部维持着一些Cache和Buffer，比如Query Cache用来缓存一条SELECT语句的执行结

果，如果能够在其中找到对应的查询结果，那么就不必再进行查询解析、优化和执行的整个过

程了，直接将结果反馈给客户端。

- 这个缓存机制是由一系列小缓存组成的。比如表缓存，记录缓存，key缓存，权限缓存等 。

- 这个查询缓存可以在 不同客户端之间共享 。

- 从MySQL 5.7.20开始，<font color =orchid>不推荐使用查询缓存，并在 MySQL 8.0中删除</font>，完全一致的sql语句，不能多一个空格。

#### 引擎层

插件式(插拔式)存储引擎层（ Storage Engines）真正的负责了MySQL中数据的存储和提取，对物理服务器级别维护的底层数据执行操作，服务器通过API与存储引擎进行通信。不同的存储引擎具有的功能不同，这样我们可以根据自己的实际需要进行选取。

MySQL 5.7支持的存储引擎如下：

![image-20230128111958370](http://images.xyzzs.top/image/image-20230128111958370.png_char)

## 存储引擎

### InnoDB

- **支持事务**，可以确保事务的完整提交(Commit)和回滚(Rollback)

- 支持行级锁

- 具备外键支持功能的事务存储引擎

- 对比MyISAM的存储引擎， InnoDB<font color=orchid>写的处理效率差一些</font> ，并且会占用更多的磁盘空间以保存数据和

  索引。

- MyISAM只缓存索引，不缓存真实数据；InnoDB不仅缓存索引还要缓存真实数据， <font color=orchid>对内存要求较高</font>，而且内存大小对性能有决定性的影响。

数据文件结构：

1. 表名.frm 存储表结构（MySQL8.0时，合并在表名.ibd中）

2. 表名.ibd 存储数据和索引

InnoDB是 为处理巨大数据量的最大性能设计 。

### MyiSAM

- 不支持事务、行级锁、外键 
- 优势是访问的 速度快 ，对事务完整性没有要求或者以SELECT、INSERT为主的应用
- 针对数据统计有额外的常数存储。故而 count(*) 的查询效率很高

数据文件结构：

1. 表名.frm 存储表结构

2. 表名.MYD 存储数据 (MYData)

3. 表名.MYI 存储索引 (MYIndex)

应用场景：只读应用或者以读为主的业务。

### archive引擎

- `archive`是`归档`的意思，<font color=orchid>**用于数据归档**</font>，仅仅支持插入和查询，插入后不能修改

- 拥有很好的压缩机制，使用 zlb压缩库，在记录请求的时候实时的进行压缩，经常被用来作为仓库使用。根据英文的测试结论来看，同样数据量下，Archive表比MyISAM表要小大约75%，比支持事务处理InnoDB表小大约83%。

数据文件结构：创建ARCHIVE表时，存储引擎会创建名称以表名开头的文件。数据文件的扩展名为.ARZ

Archive表 适合日志和数据采集(档案)类应用，<font color=orchid>适合存储大量的数据作为历史记录的数据</font>。拥有 很高的插入速度，但是对查询的支持较差。

### blackhole引擎

<font color=orchid>**丢弃写操作，读操作返回空**</font>

- Blackhole引擎没有实现任何存储机制，它会**丢弃所有插入的数据**，不做任何保存。
- 但服务器会记录Blackhole表的日志，所以可以用于复制数据到备库，或者简单地记录到日志。但这种应用方式会碰到很多问题，因此并不推荐。

### CSV引擎

<font color=orchid>**存储数据时，以逗号分隔各个数据项**</font>

- CSV引擎可以将**普通的CSV文件作为MySQL的表来处理**，但不支持索引。
- CSV引擎可以作为一种**数据交换的机制**，非常有用。
- CSV存储的敬据直接可以在操作系统里，用文本编辑器，或者excel读取。
- 对于数据的快速导入、导出是有明显优势的。

创建CSV表时，服务器会创建一个纯文本数据文件，其名称以表名开头并带有.CSV 扩展名。当你将数据存储到表中时，存储引擎将其以逗号分隔值格式保存到数据文件中。

### memory引擎

<font color=orchid>**把数据存到内存**</font>

表结构存在frm类型中，采用的逻辑介质是 内存

我的理解是：有了Redis，这货应该没啥用武之地吧？

特点：同时 支持哈希 (HASH) 索引和B+树索引

### federated引擎

<font color=orchid>**访问远程表**</font>

Federated引擎是访问其他MySQL服务器的一个**代理** ，尽管该引擎看起来提供了一种很好的 跨服务

器的灵活性 ，但也经常带来问题，因此 默认是禁用的 。

### merge引擎

管理多个MyISAM表构成的表集合

### NDB引擎

<font color=orchid>**MySQL集群专用存储引擎**</font>，也叫做 NDB Cluster 存储引擎，主要用于 MySQL Cluster 分布式集群 环境，类似于 Oracle 的 RAC 集群。



---



## 索引的数据结构

MySQL官方对索引的定义为：索引是帮助MySQL高效获取数据的**数据结构**。 

:question:思考：MySQL是如何存储每条数据记录的？

<img src="http://images.xyzzs.top/image/image-20230128151813196.png_char" alt="image-20230128151813196" style="zoom:67%;" />



`record_type`：记录头信息的一项属性，表示记录的类型， 0 表示普通记录、 2 表示最小记录、 3 表示最大记录、 1 表示目录项记录。

`next_record` ：记录头信息的一项属性，表示下一条地址相对于本条记录的地址偏移量，我们用箭头来表明下一条记录是谁。

`各个列的值` ：这里记录在表中的三个列，分别是 c1 、 c2 和 c3 。

`其他信息` ：除了上述3种信息以外的所有信息，包括其他隐藏列的值以及记录的额外信息。

### 常见索引概念

索引可以分为 2 种：聚簇（聚集）和非聚簇（非聚集）索引。我们也把非聚集索引称为二级索引或者辅助索引。

<mark>聚蔟索引</mark>

![image-20230128143358834](http://images.xyzzs.top/image/image-20230128143358834.png_char)

<font color=red>特点</font>

1. 使用记录主键值的大小进行记录和页的排序，这包括三个方面的含义：

   - <font color=orchid>页内</font>的记录是按照主键的大小顺序排成一个<font color=orchid>单向链表</font>。

   - 各个存放<font color=orchid>用户记录的页</font>也是根据页中用户记录的主键大小顺序排成一个<font color=orchid>双向链表</font>。

   - 存放<font color=orchid>目录项记录的页</font>分为不同的层次，在同一层次中的页也是根据页中目录项记录的主键大小顺序排成一个<font color=orchid>双向链表</font>。

2. B+树的**叶子节点**存储的是完整的用户记录，即这个记录中存储了所有列的值（包括隐藏列）。

<mark>非聚蔟索引</mark>

![image-20230128143451240](http://images.xyzzs.top/image/image-20230128143451240.png_char)

**回表**：我们根据以**索引列**大小排序的B+树只能确定我们要查找记录的主键值，所以如果我们想根据索引列的值查找到完整的用户记录的话，仍然需要到聚簇引中再查一遍，这个过程称为回表。也就是根据索引列的值查询一条完整的用户记录需要使用到 2 棵B+树！

### 优缺点

:thumbsup:<font color=red>优点</font>

1. 提高数据检索的效率，降低<font color=orchid>数据库的IO成本</font>，这也是创建索引最主要的原因。
2. 通过创建唯一索引，可以保证数据库表中每一行<font color=orchid>数据的唯一性 </font>。
3. 以<font color=orchid>加速表和表之间的连接</font>；换句话说，对于有依赖关系的子表和父表联合查询时，可以提高查询速度。
4. 在使用分组和排序子句进行数据查询时，可以显著<font color=orchid>减少查询中分组和排序的时间</font>，降低了CPU的消耗。	

:thumbsdown:<font color=red>缺点</font>

1. 虽然索引大大提高了查询速度，同时却会<font color=orchid>降低更新表的速度</font>。当对表中的数据进行增加、删除和修改的时候，索引也要动态地维护，这样就降低了数据的维护速度。
2. 创建索引和维护索引要<font color=orchid>耗费时间</font>，并且随着数据量的增加，所耗费的时间也会增加。
3. 索引需要占 <font color=orchid>磁盘空间</font> ，除了数据表占数据空间之外，每一个索引还要占一定的物理空间， 存储在磁盘上 ，如果有大量的索引，索引文件就可能比数据文件更快达到最大文件尺寸。



:question: B+ 树和 B 树的差异

> 1. B+ 树中，有 k 个孩子的节点就有 k 个关键字，也就是孩子数量 = 关键字数；而 B 树中，孩子数量 = 关键字数 + 1 。
> 2. 非叶子节点的关键字也会同时存在在子节点中，并且是在子节点中所有关键字的最大（或最小）。
> 3. 非叶子节点仅用于索引，不保存数据记录，跟记录有关的信息都放在叶子节点中。而 B 树中， 非叶子节点既保存索引，也保存数据记录 。
> 4. B+ 树中，所有关键字都在叶子节点出现，叶子节点构成一个有序链表，而且叶子节点本身按照关键字的大小从小到大顺序链接。

:question: 常见问题：B+树的存储能力如何? 为何说一般查找行记录，最多只需1~3次磁盘IO

> lnnoDB 存储引擎中页的大小为 16 KB，一般表的主键类型为INT (占用 4 个字节)或BIGINT(占用 8 个字节)，指针类型也一般为4或8个字节，也就是说一个页(B+Tree 中的一个节点)中大概存储16KB/(8B+8B)=1K个键值 (因为是估值，为方便计算，这里的K 取值为 10^3。也就是说一个深度为3的B+Tree 索引可以维10^3 * 10^3 * 10^3 = 10 亿条记录。(这里假定一个数据页也存储10^3条行记录数据了)
>
> 实际情况中每个节点可能不能填充满，因此在数据库中，B+Tree 的高度一般都在 2~4 层。MySQL的lnnoDB 存储引擎在设计时是将根节点常驻内存的，也就是说查找某一键值的行记录时最多只需要 1~3次磁盘I/0 操作。



## 索引设计原则

### 适合创建索引的情况

1. 字段的数值有唯一性的限制

   业务上具有唯一特性的

   字段，即使是组合字段，也必须建成唯一索引。（来源：Alibaba）

2. 频繁作为 WHERE 查询条件的字段

   某个字段在SELECT语句的 WHERE 条件中经常被使用到，那么就需要给这个字段创建索引了。尤其是在

   数据量大的情况下，创建普通索引就可以大幅提升数据查询的效率

3. 经常 GROUP BY 和 ORDER BY的列

   索引就是让数据按照某种顺序进行存储或检索，因此当我们使用 GROUP BY 对数据进行分组查询，或者使用 ORDER BY 对数据进行排序的时候，就需要对分组或者排序的字段进行索引 。如果待排序的列有多个，那么可以在这些列上建立 组合索引 。

4. UPDATE、DELETE 的 WHERE 条件列

   对数据按照某个条件进行查询后再进行 UPDATE 或 DELETE 的操作，如果对 WHERE 字段创建了索引，就能大幅提升效率。原理是因为我们需要先根据 WHERE 条件列检索出来这条记录，然后再对它进行更新或删除。**如果进行更新的时候，更新的字段是非索引字段，提升的效率会更明显，这是因为非索引字段更新不需要对索引进行维护。**

5. DISTINCT字段需要创建索引

   有时候我们需要对某个字段进行去重，使用 DISTINCT，那么对这个字段创建索引，也会提升查询效率。

6. 多表 JOIN 连接操作时，创建索引

   对 WHERE 条件创建索引 ，因为 WHERE 才是对数据条件的过滤。如果在数据量非常大的情况下，没有 WHERE 条件过滤是非常可怕的。

   对用于连接的字段创建索引 ，并且该字段在多张表中的<font color=orchid>类型必须一致</font>。比如 course_id 在student_info 表和 course 表中都为 int(11) 类型，而不能一个为 int 另一个为 varchar 类型。

7. 区分度高(散列性高)的列适合作为索引

   列的基数指的是某一列中不重复数据的个数，比方说某个列包含值2，5，8，2，5，8，2，5，8，虽然有9条记录，但该列的基数却是3。也就是说，<font color=orchid>在记录行数一定的情况下，列的基数越大，该列中的值越分散；列的基数越小，该列中的值越集中</font>。这个列的基数指标非常重要，直接影响我们是否能有效的利用索引。最好为列的基数大的列建立索引，为基数太小列的建立索引效果可能不好。
   可以使用公式 `select count(distinct a)/count(*) from t1` 计算区分度，越接近1越好，一般超过33%就算是比较高效的索引了。
   拓展: 联合索引把区分度高(散列性高)的列放在前面

8. 在多个字段都要创建索引的情况下，联合索引优于单值索引，将使用最频繁的列放到联合索引的左侧

### 不适合创建索引的情况

1. 在where中使用不到的字段，不要设置索引
2. 数据量小的表最好不要使用索引
3.  有大量重复数据的列上不要建立索引
4. 避免对经常更新的表创建过多的索引
5. 不建议用无序的值作为索引
6. 不要定义冗余或重复的索引

### 索引的限制

在实际工作中，我们也需要注意平衡，索引的数目不是越多越好。我们需要限制每张表上的索引数量，建议单张表索引数量<font color=orchid>不超过6个</font>。原因:

1. 每个索引都需要<font color=orchid>占用磁盘空间</font>，索引越多，需要的磁盘空间就越大。
2. 索引会<font color=orchid>影响INSERT、DELETE、UPDATE等语句的性能</font>，因为表中的数据更改的同时，索引也会进行调整和更新，会造成负担。
3. 优化器在选择如何优化查询时，会根据统一信息，<font color=orchid>对每一个可以用到的索引来进行评估</font>，以生成出一个最好的执行计划，如果同时有很多个索引都可以用于查询，会增加MVSOL优化器生成执行计划时间，降低查询性能

###  索引失效情况

1. like以通配符%开头导致失效：<font color=orchid>最佳左前缀法则</font>，索引文件具有 B-Tree 的最左前缀匹配特性，如果左边的值未确定，那么无法使用此索引。若是联合索引，必须严格从左往右匹配

   > 页面搜索严禁左模糊或者全模糊，如果需要请走搜索引擎来解决。

2. 计算、函数导致失效：运算符右边不能出现函数、计算

3. 类型转换导致失效：类型转换会调用函数

4. 范围条件右边的列索引失效：<	<=	>	>=	between等范围查找条件，放在语句最后

5. 不等于(!=或者<>)索引失效

6. is null可以使用索引，is not null 无法使用索引，not like同理

7. or前后存在非索引的列

8. 不同的**字符集 **进行比较前需要进行**转换**会造成索引失效：统一使用utf8mb4( 5.5.3版本以上支持)兼容性更好，统一字符集可以避免由于字符集转换产生的乱码。

**索引使用小建议**

- 对于单列索引，尽量选择针对当前query过滤性更好的索引
- 在选择组合索引的时候，当前query中过滤性最好的字段在索引字段顺序中，位置越靠前越好
- 在选择组合索引的时候，尽量选择能够包含当前query中的where子句中更多字段的索引。
- 在选择组合索引的时候，如果某个字段可能出现范围查询时，尽量把这个字段放在索引次序的最后面。

### 优先考虑覆盖索引

不回表。二级索引上有查询的所有的数据

一切基本成本

```sql
-- 覆盖索引，因为不需要回表，优化器会选择使用索引
-- 以下情况都会使用索引，一切基本成本
举例1
select age,id from student where age <> 20;
举例2
select id,age,name from student where name like '%abc';
```

sql

### 如何给字符串添加索引



### 索引下推（ICP）

减少回表次数

联合索引，在失效时，作为条件删选，减少回表次数

```sql
select * from s1 where key1 > 'z' and key1 like '%a';
```

ICP默认开启

```sql
#关闭索引下推
set optimizer_switch = 'index_condition_pushdown=off';
--打开索引下推
set optimizer_switch = 'index_condition_pushdown=on';
```



## 查询优化

### 关联查询优化

1. 外连接—<font color=silver>以左外连接为例，右外连接可以转换为左外连接</font>

   左外连接：左边的表做为驱动表，右边的表做为被驱动表（前提是语句没被优化器重写）

2. 内连接

   对于内连接连说，查询优化器可以决定谁作为驱动表，谁作为被驱动表。如果<font color=orchid>连接字段</font>上只有一张表上有索引，经过成本计算发现，有索引的表作为被驱动表成本是比较低的。

   <font color=red>结论</font>

   1. 如果表连接条件中，若只有一个字段有索引，则有索引的字段所在表会被作为被驱动表
   2. 如果在两个表的连接条件都存在索引的情况下，会选择<font color=orchid>小表（小的结果集，过滤后表行数 * 每行数据大小）</font>做为驱动表，<font color=orchid>小表驱动大表</font>。

   ---

<mark>JOIN语句原理</mark>

1. <font color=red>Simple Nested-Loop Join</font>—简单嵌套循环连接

   算法相当简单，从表A中取出一条数据1，遍历表B，将匹配到的数据放到result.....以此类推，驱动表A中的每一条记录与被驱动表B的记录进行判断

   ![image-20230128221019928](http://images.xyzzs.top/image/image-20230128221019928.png_char_char)

   可以看到这种方式效率是非常低的，以上述表A数据100条，表B数据1000条计算，则A*B = 10万次。

   | 开销统计         | Simple Nested-Loop Join |
   | ---------------- | ----------------------- |
   | 外表扫描次数     | 1                       |
   | 内表扫描次数     | A                       |
   | 读取记录数       | A + B*A                 |
   | Join比较次数     | B*A                     |
   | 回表读取记录次数 | 0                       |

2. <font color=red>Index Nested-Loop Join</font>—索引嵌套循环连接

   Index Nested-Loop Join其优化的思路主要是为了<font color=orchid>减少内层表数据的匹配次数</font>，所以<font color=orchid>要求被驱动表上必须有索引</font>才行。通过外层表匹配条件直接与内层表索引进行匹配，避免和内层表的每条记录去进行比较，这样极大的减少了对内层表的匹配次数。

   | 开销统计         | Index Nested-Loop Join |
   | ---------------- | ---------------------- |
   | 外表扫描次数     | 1                      |
   | 内表扫描次数     | 0                      |
   | 读取记录数       | A + B(match)           |
   | Join比较次数     | A*Index(Height)        |
   | 回表读取记录次数 | B(match)(if possibale) |

3. <font color=red> Block Nested-Loop Join</font>—块嵌套循环连接

   ![image-20230128222645164](http://images.xyzzs.top/image/image-20230128222645164.png_char)

   | 开销统计         | Block Nested-Loop Join                         |
   | ---------------- | ---------------------------------------------- |
   | 外表扫描次数     | 1                                              |
   | 内表扫描次数     | A*used_column_size/join_biffer_size+1          |
   | 读取记录数       | A+B * ( A * used_column_size/join_buffer_size) |
   | Join比较次数     | B * A                                          |
   | 回表读取记录次数 | 0                                              |

**小结**

1. 整体效率比较: 索引嵌套循环连接 > 块嵌套循环连接> 简单嵌套循环连接
2. 永远用小结果集驱动大结果集(其本质就是减少外层循环的数据数量) 
3. 为被驱动表匹配的条件增加索引(减少内层表的循环匹配次数)
4. 增大join buffer size的大小 (一次缓存的数据越多，那么内层包的扫表次数就越少)
5. 减少驱动表不必要的字段查询 (字段越少，join bufer 所缓存的数据就越多)

**总结**

- 保证被驱动表的JOIN字段已经创建了索引
- 需要JOIN 的字段，数据类型保持绝对一致。
- LEFT JOIN 时，选择小表作为驱动表，大表作为被驱动表（减少外层循环的次数）
- INNER JOIN 时，MySQL会自动将 小结果集的表选为驱动表，选择相信MySQL优化策略
- 衍生表建不了索引

### 子查询优化

MySQL从4.1版本开始支持子查询，使用子查询可以进行SELECT语句的嵌套查询，即一个SELECT查询的结果作为另一个SELECT语句的条件。子查询可以一次性完成很多逻辑上需要多个步骤才能完成的SOL操作
子查询是 MySQL 的一项重要的功能，可以帮助我们通过一个 SQL 语句实现比较复杂的查询。但是，<font color=orchid>子查询的执行效率不高</font>。原因:

1. 执行子查询时，MySQL需要为内层查询语句的查询结果**建立一个临时表**，然后外层查询语句从临时表中查询记录。查询完毕后，再**撤销这些临时表**。这样会消耗过多的CPU和IO资源，产生大量的慢查询。
2. 子查询的结果集存储的临时表，不论是内存临时表还是磁盘临时表都**不会存在索引**，所以查询性能会受到一定的影响。
3. 对于返回结果集比较大的子查询，其对查询性能的影响也就越大

在MySQL中，<font color=orchid>可以使用连接(JOIN) 查询来替代子查询</font>。连接查询**不需要建立临时表**，其**速度比子查询要快**，如果查询中使用索引的话，性能就会更好。

- 不建议使用子查询，建议将子查询SQL拆开结合程序多次查询，或使用JOIN 来代替子查询
- 能够直接多表关联的尽量直接关联，不用子查询。(减少查询的趟数)

### 排序查询优化

:question:问题：在 WHERE 条件字段上加索引，但是为什么在 ORDER BY 字段上还要加索引呢？

在 MySQL 中，支持两种排序方式，分别是 <font color=orchid>FileSort</font> 和 <font color=orchid>Index</font> 排序

- Index 排序中，索引可以保证数据的有序性，不需要再进行排序， <font color=orchid>效率更高</font>。
- FileSot 排序则一般在**内存中**进行排序，占用 CPU 较多。如果待排结果较大，会产生临时文件 IO 到磁盘进行排序的情况，<font color=orchid>效率较低</font>。

**优化建议：**

1. SQL 中，可以在 WHERE 子句和 ORDER BY 子句中使用索引，目的是在 WHERE 子句中**避免全表扫描**，在 ORDER BY 子句**避免使用 FileSort 排序**。当然，某些情况下全表扫描，或者 FileSort 排序不一定比索引慢。但总的来说，我们还是要避免，以提高查询效率。
2. 尽量使用 Index 完成 ORDER BY 排序。如果 WHERE 和 ORDER BY 后面是相同的列就使用单索引列；如果不同就使用联合索引。
3. 无法使用 Index 时，需要对 FileSort 方式进行调优，增大`max_length_for_sort_data`和 `sort_buffer_size` 参数的设置。

优化思路：

方案一: 为了去掉filesort我们可以把索引建成

方案二:尽量让where的过滤条件和排序使用上索引

<font color=red>小结</font>

```mysql
INDEX a_b_c(a,b,c)

order by -- 能使用索引最左前缀
- ORDER BY a
- ORDER BY a,b
- ORDER BY a,b,c
- ORDER BY a DESC,b DESC,c DESC

-- 如果WHERE使用索引的最左前缀定义为常量，则order by 能使用索引
- WHERE a = const ORDER BY b,c
- WHERE a = const AND b = const ORDER BY c
- WHERE a = const ORDER BY b,c
- WHERE a = const AND b > const ORDER BY b,c

-- 不能使用索引进行排序
- ORDER BY a ASC,b DESC,c DESC /* 排序不一致 */
- WHERE g = const ORDER BY b,c /*丢失a索引*/
- WHERE a = const ORDER BY c /*丢失b索引*/
```



### group by优化

- group by 使用索引的原则几乎跟order by一致。
- group by 先排序再分组，遵照索引建的最佳左前缀法则
- 当无法使用索引列，增大`max_length_for_sort_data`和 `sort_buffer_size `参数的设置
- where效率高于having，能写在where限定的条件就不要写在having中了
- 减少使用order by，和业务沟通能不排序就不排序，或将排序放到程序端去做。Order by、group by、distinct这些语句较为耗费CPU，数据库的CPU资源是极其宝贵的。
- 包含了order by、group by、distinct这些查询的语句，where条件过滤出来的结果集请保持在1000行以内，否则SQL会很慢。

### 优化分页查询

一般分页查询时，通过创建覆盖索引能够比较好地提高性能。

一个常见又非常头疼的问题就是 `limit 1000000,10`此时需要MysQL排序前1000010 记录，仅仅返回 1000000-1000010  的记录，其他记录丢弃，查询排序的代价常大

```sql
EXPLAIN SELECT * FROM student LIMIT 1000000,10;
```



<font color=red>优化思路一</font>

在索引上完成排序分页操作，最后根据主键关联回原表查询所需要的其他列内容。

```sql
EXPLAIN SELECT DISTINCT * FROM student t,(SELECT id FROM student ORDER BY id LIMIT 2000000,10) a WHERE t.id = a.id;
```

<font color=red>优化思路二</font>

该方案适用于主键自增的表，可以把Limit 查询转换成某个位置的查询 。

```sql
EXPLAIN SELECT * FROM student WHERE id > 2000000 LIMIT 10;
```



### 其他查询优化策略

:question:count(*)和count(具体字段)效率

- 对于 COUNT(*)和 COUNT(1)来说，它们不需要查找具体的行，只是统计行数，系统会自动 采用占用空间更小的二级索引来进行统计。
- 如果采用 COUNT(具体字段)来统计数据行数，要尽量采用二级索引。因为主键采用的索引是聚族索引，聚族索引包含的信息多，明显会大于二级索引(非聚族索引)。

:question:关于(select * )

在表查询中，建议明确字段，不要使用`*`作为查询的字段列表，推荐使用SELECT<字段列表>查询。原因:

-  MySQL 在解析的过程中，会通过查询数据字典将按序转换成所有列名，这会大大的耗费资源和时间
- 无法使用**覆盖索引**

:question:limit1对优化的影响

- 针对的是会扫描全表的 SQL 语句，如果你可以确定结果集只有一条，那么加上 `LIMIT 1`的时候，当找到一条结果的时候就不会继续扫描了，这样会加快查询速度。
- 如果数据表已经对字段建立了唯一索引，那么可以通过索引进行查询，不会全表扫描的话，就不需要加上`LIMIT 1`



## 性能分析

### 服务器优化步骤

当我们遇到数据库调优问题的时候，该如何思考呢？这里把思考的流程整理成下面这张图。

整个流程划分成了 观察（Show status） 和 行动（Action） 两个部分。字母 S 的部分代表观察（会使

用相应的分析工具），字母 A 代表的部分是行动（对应分析可以采取的行动）。

![image-20230128181253474](http://images.xyzzs.top/image/image-20230128181253474.png_char)

首先在 S1部分，我们需要观察服务器的状态是否存在周期性的波动。如果 存在周期性波动，有可能是周期性节点的原因，比如双十一、促销活动等。这样的话，我们可以通过 A1 这一步骤解决，也就是加缓存，或者更改缓存失效策略。
如果缓存策略没有解决，或者不是周期性波动的原因，我们就需要进一步 分析查询延迟和卡顿的原因。接下来进入S2 这一步，我们需要开启慢查询。慢查询可以帮我们定位执行慢的 SQL 语句。我们可以通过设置long_query_time 参数定义“慢”的闻值，如果 SQL 执行时间超过了longquery_time，则会认为是慢查询。当收集上来这些慢查询之后，我们就可以通过分析工具对慢查询日志进行分析。
在S3 这一步骤中，我们就知道了执行慢的 SQL，这样就可以针对性地用 EXPLAIN 查看对应 SQL 语句的执行计划，或者使用 show profile 查看SQL 中每一个步的时间成本。这样我们就可以了解 SQL 查询慢是因为执行时间长，还是等待时间长。
如果是 SQL 等待时间长，我们进入 A2 步骤。在这一步骤中，我们可以 调优服务器的参数，比如适当增加数据库缓冲池等。如果是SQL执行时间长，就进入A3 步骤，这一步中我们需要考虑是索引设计的问题?还是查询关联的数据表过多?还是因为数据表的字段设计问题导致了这一现象。然后在这些维度上进行对应的调整
如果 A2和A3 都不能解决问题，我们需要考虑数据库自身的 SQL 查询性能是否已经达到了瓶颈，如果确认没有达到性能瓶颈，就需要重新检查，重复以上的步骤。如果已经达到了性能瓶颈，进入A4 阶段，需要考虑 增加服务器，采用读写分离的架构，或者考虑对数据库进行 分库分表，比如垂直分库、垂直分表和水平分表等
以上就是数据库调优的流程思路。如果我们发现执行 SOL 时存在不规则延迟或卡顿的时候，就可以采用分析工具帮我们定 SQL，这三种分析工具你可以理解是 SQL 调优的三个步骤: 慢查询、EXPLAIN 和 SHOW

小结：

![image-20230128181437272](http://images.xyzzs.top/image/image-20230128181437272.png_char)

### 查看系统性能参数

在MySQL中，可以使用 SHOW STATUS 语句查询一些MySQL数据库服务器的 性能参数 、 执行频率 。

SHOW STATUS语句语法如下：

```sql
SHOW [GLOBAL|SESSION] STATUS LIKE 'Connections';
```

一些常用的性能参数如下：

- Connections：连接MySQL服务器的次数。

- Uptime：MySQL服务器的上线时间。 

- Slow_queries：慢查询的次数。 

- Innodb_rows_read：Select查询返回的行数

- Innodb_rows_inserted：执行INSERT操作插入的行数

- Innodb_rows_updated：执行UPDATE操作更新的行数 

- Innodb_rows_deleted：执行DELETE操作删除的行数 

- Com_select：查询操作的次数。 

- Com_insert：插入操作的次数。对于批量插入的 INSERT 操作，只累加一次。 

- Com_update：更新操作的次数。 

- Com_delete：删除操作的次数。

- last_query_cost：统计SQL的查询成本



### 定位执行慢的SQL—慢查询日志

<mark>开启慢查询日志参数</mark>

1. 开启<font color=orchid>slow_query_log</font>

   ```sql
   -- 查看慢查询日志是否开启
   show variables like '%slow_query_log%';
   -- 开启
   set global slow_query_log='ON';
   ```

   ![image-20230128183327140](http://images.xyzzs.top/image/image-20230128183327140.png_char_char)

   还可查看到文件保存在`/var/lib/mysql/f4a77eb900f0-slow.log`

2. 修改<font color=orchid>long_query_time</font>阈值

   ```sql
   -- 查看慢查询的时间阈值
   show variables like '%long_query_time%';
   -- 修改阈值
   set global long_query_time = 1;
   set long_query_time = 1;
   ```

   ![image-20230128183701616](http://images.xyzzs.top/image/image-20230128183701616.png_char)

<font color=red>补充</font>：在配置文件中永久修改

```properties
[mysqld]
slow_query_log=ON 	#开启慢查询日志的开关
slow_query_log_file=/var/lib/mysql/f4a77eb900f0-slow.log  #慢询日志的目求和文件名信息
long_query_time=3 #设置慢查询的阈值为3秒，超出此设定值的SQL即被记录到慢查询日志
```

如果不指定存储路径，慢查询日志将默认存储到MySQL数据库的数据文件夹下。如果不指定文件名，默认文件名为hostname-slow.log。

<mark>查看慢查询数目</mark>

```sql
SHOW GLOBAL STATUS LIKE '%Slow_queries%';
```

<mark>慢查询日志分析工具</mark>：<font color=orchid>mysqldumpslow</font>

```sql
-- 查看mysqldumpslow的帮助信息
mysqldumpslow --help
```

mysqldumpslow 命令的具体参数如下：

- -a: 不将数字抽象成N，字符串抽象成S

- -s: 是表示按照何种方式排序：
  - c: 访问次数
  - l: 锁定时间
  - r: 返回记录
  - t: **查询时间**
  - al:平均锁定时间
  - ar:平均返回记录数
  - at:平均查询时间 （默认方式）
  - ac:平均查询次数
- -t: 即为返回前面多少条的数据；
- -g: 后边搭配一个正则匹配模式，大小写不敏感的；

<font color=red>**工作常用参考**</font>

```sql
#得到返回记录集最多的10个SQL
mysqldumpslow -s r -t 10 /var/lib/mysql/f4a77eb900f0-slow.log

#得到访问次数最多的10个SQL
mysqldumpslow -s c -t 10 /var/lib/mysql/f4a77eb900f0-slow.log

#得到按照时间排序的前10条里面含有左连接的查询语句
mysqldumpslow -s t -t 10 -g "left join" /var/lib/mysql/f4a77eb900f0-slow.log

#另外建议在使用这些命令时结合 | 和more 使用 ，否则有可能出现爆屏情况
mysqldumpslow -s r -t 10 /var/lib/mysql/f4a77eb900f0-slow.log | more
```

### 查看sql执行成本—show profile

```sql
-- 查看show profile参数
show variables like 'profiling';
-- 开启show profile
set profiling = 'ON';
-- 执行相关的查询语句后，接着看下当前会话都有哪些 profiles，使用下面这条命令
show profiles;
-- 如果我们想要查看最近一次查询的开销，可以使用：
show profile;
-- 也可以通过指定id、字段查看
show profile cpu,block io for query 2;
```

show profile的常用查询参数：

① ALL：显示所有的开销信息。 ② BLOCK IO：显示块IO开销。 ③ CONTEXT SWITCHES：上下文切换开

销。 ④ CPU：显示CPU开销信息。 ⑤ IPC：显示发送和接收开销信息。 ⑥ MEMORY：显示内存开销信

息。 ⑦ PAGE FAULTS：显示页面错误开销信息。 ⑧ SOURCE：显示和Source_function，Source_file，

Source_line相关的开销信息。 ⑨ SWAPS：显示交换次数开销信息。

![image-20230128191056449](http://images.xyzzs.top/image/image-20230128191056449.png_char)

### 分析查询语句—explain

![img](http://images.xyzzs.top/image/1652029508781-717363ac-66c9-45c0-83a3-6dc446bce13d.png_char)

1. <mark>id</mark>

- id如果相同，可以认为是一组，从上往下执行

- 在所有组中，id值越大，优先级越高，越先执行

关注点：id号每个号码，表示一趟独立的查询，一个sql查询趟数越少越好

2. <mark>table</mark>

表名，驱动表（第一张表），被驱动表

3. <mark>select_type</mark>

simple、primary、subquery、derived、

4. <mark>partitions</mark>

   查看数据在哪个分区

5. <mark>type</mark>:star:

![img](http://images.xyzzs.top/image/1652029000444-9e1e34a6-9e2c-41d9-a917-978481fda7da.png_char)

<font color=red>system</font>：当表中只有一条记录，并且该表使用的存储引擎的统计数据是精确的。

<font color=red>const</font>：根据主键或者唯一二级索引列与常数进行等值匹配时。

<font color=red>eq_ref</font>：连接查询时，如果被驱动表是通过主键或者唯一二级索引列等值匹配进行访问的（如果主键或者唯一二级索引是联合索引的话，所有索引列必须都进行等值比较），则被驱动表的访问方法是eq_ref

<font color=red>ref</font>：当普通的二级索引列与常量进行等值匹配来查询某个表

<font color=red>fulltext</font>：全文索引

<font color=red>ref_or_null</font>：当普通的二级索引列与常量进行等值匹配来查询，该索引列的值也可以是`null` 

<font color=red>indes_merge</font>：两个索引合并上

<font color=red>unique_subquery</font>：

<font color=red>index_subquery</font>：

<font color=red>range</font>：使用索引获取范围区间的记录

<font color=red>index</font>：可以使用索引覆盖，但需要扫描全部的索引记录时

<font color=red>all</font>：全表扫描

6. <mark>possible_keys</mark>

单表查询时，有可能用到的索引

7. <mark>key</mark>

实际使用到的索引

8. <mark>key_len</mark>:star:

实际使用到的索引长度（字节数）

帮你检查是否充分的利用上了索引，值越大越好，主要针对于联合索引

9. <mark>ref</mark>

当使用索引列等值查询时，与索引列进行等值匹配的是对象信息，与type结合理解。

10. <mark>rows</mark>:star:

预估的需要读取的记录条数，值越小越好

11. <mark>filtered</mark>

某个表经过搜索条件过滤后剩余记录数的百分比

12. <mark>extra</mark>:star:

- Impossible WHERE：不可能的过滤条件
- Using where：
- No matching min/max row：没有符合where搜索条件的记录
- Using index：使用索引
- Using index condition：使用索引条件下推（ICP）
- Using join buffer (Block Nested Loop)：为被驱动表分配一块内存块，加快查询速度
- Not exists：不存在，类似mpossible where
- Using intersect(...) 、 Using union(...) 和 Using sort_union(...)
- Zero limit：limit参数为0
- Using filesort：在内存或磁盘中进行文件排序
- Using temporary：在distinct、group by、order by、union等子句的查询过程中，不能有效利用索引完成

**小结**

- EXPLAIN不考虑各种Cache

- EXPLAIN不能显示MySQL在执行查询时所作的优化工作

- EXPLAIN不会告诉你关于触发器、存储过程的信息或用户自定义函数对查询的影响情况

- 部分统计信息是估算的，并非精确值

**拓展**

1. <mark>EXPLAIN四种输出格式</mark>

   - 传统格式

     ```sql
     EXPLAIN SELECT ...
     ```

   - json格式：比传统格式信息更多，<font color=orchid>包含成本开销信息</font>

     在EXPLAIN单词和真正的查询语句中间加上 FORMAT=JSON 。

     ```sql
     EXPLAIN FORMAT=JSON SELECT ...
     ```

   - tree格式：层次结构更清晰

     ```sql
     EXPLAIN FORMAT=tree SELECT ...
     ```

   - 可视化输出：Workbench

     复杂的查询语句，可使用此工具，包含的信息全面，且图形界面非常直观，用不同颜色区分type

2. <mark>show warnings的使用</mark>

   在我们使用 `EXPLAIN` 语句查看了某个查询的执行计划后，紧接着还可以使用 <font color=orchid>`SHOW WARNINGS` </font>语句查看与这个查询的执行计划有关的一些扩展信息：message中的语句为优化器重写后的语句，即真正执行的sql语句

![img](http://images.xyzzs.top/image/1654332925379-9150d421-9765-4b58-b825-be6f7923e552.png_char)

3. <mark>分析优化器执行计划</mark>

`OPTIMIZER_TRACE `是MySQL 5.6引入的一项跟踪功能，它可以跟踪优化器做出的各种决策 (比如访问表的方法、各种开销计算、各种转换等)，并将跟踪结果记录到`INFORMATIONSCHEMA.OPTIMIZER_TRACE` 表中。

```sql
-- 开启，并设置格式为JSON
SET optimizer_trace="enabled=on",end_markers_in_json=on;
-- 设置trace最大内存，避免过小不能完整展示
set optimizer_trace_max_mem_size=1000000;
```

4. <mark>MySQL监控分视图</mark> sys schema

   **1.** **主机相关：**以host_summary开头，主要汇总了IO延迟的信息。

   **2. Innodb**相关：以innodb开头，汇总了innodb buffer信息和事务等待innodb锁的信息。

   **3. I/o**相关：以io开头，汇总了等待I/O、I/O使用量情况。

   **4.** **内存使用情况：**以memory开头，从主机、线程、事件等角度展示内存的使用情况

   **5.** **连接与会话信息：**processlist和session相关视图，总结了会话相关信息。

   **6.** **表相关：**以schema_table开头的视图，展示了表的统计信息。

   **7.** **索引信息：**统计了索引的使用情况，包含冗余索引和未使用的索引情况。

   **8.** **语句相关：**以statement开头，包含执行全表扫描、使用临时表、排序等的语句信息。

   **9.** **用户相关：**以user开头的视图，统计了用户使用的文件I/O、执行语句统计信息。

   **10.** **等待事件相关信息：**以wait开头，展示等待事件的延迟情况。

   <font color=red>使用场景</font>

   - 索引相关

     ```sql
     #1. 查询冗余索引
     select * from sys.schema_redundant_indexes;
     #2. 查询未使用过的索引
     select * from sys.schema_unused_indexes;
     #3. 查询索引的使用情况
     select index_name,rows_selected,rows_inserted,rows_updated,rows_deleted
     from sys.schema_index_statistics where table_schema='dbname' ;
     ```

   - 表相关

     ```sql
     # 1. 查询表的访问量
     select table_schema,table_name,sum(io_read_requests+io_write_requests) as io from
     sys.schema_table_statistics group by table_schema,table_name order by io desc;
     # 2. 查询占用bufferpool较多的表
     select object_schema,object_name,allocated,data
     from sys.innodb_buffer_stats_by_table order by allocated limit 10;
     # 3. 查看表的全表扫描情况
     select * from sys.statements_with_full_table_scans where db='dbname';
     ```

   - 语句相关

     ```sql
     #1. 监控SQL执行的频率
     select db,exec_count,query from sys.statement_analysis
     order by exec_count desc;
     #2. 监控使用了排序的SQL
     select db,exec_count,first_seen,last_seen,query
     from sys.statements_with_sorting limit 1;
     #3. 监控使用了临时表或者磁盘临时表的SQL
     select db,exec_count,tmp_tables,tmp_disk_tables,query
     from sys.statement_analysis where tmp_tables>0 or tmp_disk_tables >0
     order by (tmp_tables+tmp_disk_tables) desc;
     ```

   - IO相关

     ```sql
     #1. 查看消耗磁盘IO的文件
     select file,avg_read,avg_write,avg_read+avg_write as avg_io
     from sys.io_global_by_file_by_bytes order by avg_read limit 10;
     ```

   - innodb相关

     ```sql
     #1. 行锁阻塞情况
     select * from sys.innodb_lock_waits;
     ```



## 数据库的设计规范

![img](http://images.xyzzs.top/image/1652114277688-d7e0231e-faf5-4fb1-84b9-acbcc490cbc3.png_char)



## 事务基础知识

**事务处理的原则：**保证所有事务都作为 一个工作单元 来执行，即使出现了故障，都不能改变这种执行方式。当在一个事务中执行多个操作时，要么所有的事务都被提交( commit )，那么这些修改就永久地保存下来；要么数据库管理系统将放弃所作的所有 修改 ，整个事务回滚( rollback )到最初状态。

### 事务的ACID特性

- 原子性（atomicity）— undo

  原子性是指事务是一个不可分割的工作单位，要么全部提交，要么全部失败回滚。

- 一致性（consistency）— undo

  根据定义，一致性是指事务执行前后，数据从一个<font color=orchid>合法性状态</font>变换到另外一个合法性状态。

  那什么是合法的数据状态呢？满足<font color=orchid>预定的约束</font>的状态就叫做合法的状态。通俗一点，这状态是由你自己来定义的（比如满足现实世界中的约束）。满足这个状态，数据是一致的，不满足这个状态，数据就是不一致的！如果事务中的某个操作失败了，系统就会自动撤销当前正在执行的事务，返回到事务操作之前的状态，比如转账就是一个很好的例子，A账户扣掉100元，B账户必须加100元，若操作失败，则A、B账户必须退回到操作前的状态。

- 隔离型（isolation）— 锁机制

  事务的隔离性是指一个事务的执行<font color=orchid>不能被其他事务干扰</font>，即一个事务内部的操作及使用的数据对<font color=orchid>并发</font>的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。

- 持久性（durability）— redo

  持久性是指一个事务一旦被提交，它对数据库中数据的改变就是<font color=orchid>永久性的</font>，接下来的其他操作和数据库故障不应该对其有任何影响。

  持久性是通过<font color=orchid>事务日志</font>来保证的。日志包括了 重做日志 和 回滚日志 。当我们通过事务对数据进行修改的时候，首先会将数据库的变化信息记录到重做日志中，然后再对数据库中对应的行进行修改。这样做的好处是，即使数据库系统崩溃，数据库重启后也能找到没有更新到数据库系统中的重做日志，重新执行，从而使事务具有持久性。

> ACID 是事务的四大特性，在这四个特性中，原子性是基础，隔离性是手段，一致性是约束条件，而持久性是我们的目的。

### 事务的状态

我们现在知道事务是一个抽象的概念，它其实对应着一个或多个数据库操作，MySQL根据这些操作所执行的不同阶段把事务大致划分成几个状态：

- 活动的

  事务对应的数据库操作<font color=orchid>正在执行过程中</font>时，我们就说该事务处在活动的状态。

- 部分提交的

  当事务中的最后一个操作执行完成，但由于操作都在内存中执行，所造成的影响并<font color=orchid>没有刷新到磁盘</font>时，我们就说该事务处在部分提交的状态。

- 失败的

  当事务处在 活动的 或者 部分提交的 状态时，可能遇到了某些错误（数据库自身的错误、操作系统错误或者直接断电等）而无法继续执行，或者人为的停止当前事务的执行，我们就说该事务处在 失败的 状态。

- 中止的

  如果事务执行了一部分而变为 失败的 状态，那么就需要把已经修改的事务中的操作还原到事务执行前的状态。换句话说，就是要撤销失败事务对当前数据库造成的影响。我们把这个撤销的过程称之为回滚。当回滚操作执行完毕时，也就是数据库恢复到了执行事务之前的状态，我们就说该事务处在了中止的状态。

- 提交的

  当一个处在 部分提交的 状态的事务将修改过的数据都 同步到磁盘 上之后，我们就可以说该事务处在了 提交的 状态。



![image-20230129220614751](http://images.xyzzs.top/image/image-20230129220614751.png_char)



### 事务的安全问题

数据并发问题：访问相同数据的事务在**不保证串行执行**（也就是执行完一个再执行另一个）的情况下可能会出现哪些问题：

- 脏写：A事务**修改**了B事务未提交的数据

  对于两个事务 Session A、Session B，如果事务Session A <font color=orchid>修改了另一个未提交事务</font>Session B 修改过 的数据，那就意味着发生了脏写

- 脏读：A事务**读取**了B事务未提交的数据

  对于两个事务 Session A、Session B，Session A 读取了已经被 Session B 更新但还没有被提交的字段。之后若 Session B 回滚 ，Session A 读取的内容就是<font color=orchid>临时且无效</font>的。

  Session A和Session B各开启了一个事务，Session B中的事务先将studentno列为1的记录的name列更新为'张三'，然后Session A中的事务再去查询这条studentno为1的记录，如果读到列name的值为'张三'，而Session B中的事务稍后进行了回滚，那么Session A中的事务相当于读到了一个不存在的数据，这种现象就称之为 脏读 。

- 不可重复读：A事务再次读取同一字段，和之前不一样

  对于两个事务Session A、Session B，Session A 读取 了一个字段，然后 Session B 更新 了该字段。 之后Session A <font color=orchid>再次读取</font>同一个字段， <font color=orchid>值就不同了</font>。那就意味着发生了不可重复读。

- 幻读：读取同一个表，读取到的数据变多了，另一个事务insert（<font color=orchid>删除不算幻读</font>）

  对于两个事务Session A、Session B, Session A 从一个表中**读取**了一个字段, 然后 Session B 在该表中**插入**了一些新的行。 之后, 如果 Session A <font color=orchid>再次读取</font>同一个表, 就会多出几行。那就意味着发生了幻读。

### SQL的隔离级别

上面介绍了几种并发事务执行过程中可能遇到的一些问题，这些问题有轻重缓急之分，我们给这些问题按照严重性来排一下序：

```text
脏写 > 脏读 > 不可重复读 > 幻读。
```

**SQL标准**中设立了4个隔离级别 ：隔离级别越低，并发问题发生的就越多

| 隔离级别        | 脏写可能性 | 脏读可能性 | 不可重复读可能性 | 幻读可能性 |
| --------------- | ---------- | ---------- | ---------------- | ---------- |
| read uncommited | 不可能     | 可能       | 可能             | 可能       |
| read commited   | 不可能     | 不可能     | 可能             | 可能       |
| repeatable read | 不可能     | 不可能     | 不可能           | 可能       |
| serializable    | 不可能     | 不可能     | 不可能           | 不可能     |

- READ UNCOMMITTED ：读未提交，在该隔离级别，所有事务都可以看到其他未提交事务的执行结果。不能避免脏读、不可重复读、幻读。

- READ COMMITTED ：读已提交，它满足了隔离的简单定义：一个事务只能看见已经提交事务所做的改变。这是大多数数据库系统的默认隔离级别（但不是MySQL默认的）。可以避免脏读，但不可重复读、幻读问题仍然存在。

- REPEATABLE READ（mysql默认级别） ：可重复读，事务A在读到一条数据之后，此时事务B对该数据进行了修改并提交，那么事务A再读该数据，读到的还是原来的内容。可以避免脏读、不可重复读，但幻读问题仍然存在。这是MySQL的默认隔离级别。

-  SERIALIZABLE ：可串行化，确保事务可以从一个表中读取相同的行。在这个事务持续期间，禁止其他事务对该表执行插入、更新和删除操作。所有的并发问题都可以避免，但性能十分低下。能避免脏读、不可重复读和幻读。

### 事务的常见分类

TODO

扁平事务

带有保存点的扁平事务

链事务

嵌套事务

分布式事务



## MySQL事务日志

REDO和 UNDO 都可以视为是一种 恢复操作，但是:

- redo log: 是存储引擎层(innodb)生成的日志，记录的是<font color=orchid>物理级别</font>上的页修改操作，比如页号xxx、偏移量yyy写入了zzz数据。主要为了保证数据的可靠性;
- undo log: 是存储引擎层(inndb)生成的日志，记录的是<font color=orchid>逻辑操作</font>日志，比如对某一行数据进行了INSERT语句操作，那么 undo log就记录一条与之相反的DELETE操作。主要用于<font color=orchid>事务的回滚</font>(undo log 记录的是每个修改操作的逆操作)和<font color=orchid>一致性非锁定读</font>(undo log 回滚行记录到某种特定的版本---MVCC，即多版本并发控制)。

### redo日志

重做日志：提供再写入操作，恢复提交事务修改的页操作，用来保证事务的`持久性`。

> Write-Ahead Log(预先日志持久化)：在持久化一个数据页之前，先将内存中相应的日志页持久化。

<mark>为什么需要redo日志</mark>

事务包含持久性的特性，就是说对于一个已经提交的事务，在事务提交后即使系统发生了崩溃，这个事务对数据库中所做的更改也不能丢失。那么如何保证这个持久性呢？ 一个简单的做法 ：在事务提交完成之前把该事务所修改的所有页面都刷新到磁盘，但是这个简单粗暴的做法有些问题：

- 修改量与刷新磁盘工作量严重不成比例

  有时候我们仅仅修改了某个页面中的一个字节，但是我们知道在lnnoDB中是以页为单位来进行磁盘IO的，也就是说我们在该事务提交时不得不将一个完整的页面从内存中刷新到磁盘，我们又知道一个页面默认是16KB大小，只修改一个字节就要刷新16KB的数据到磁盘上显然是太小题大做了

- 随机IO刷新较慢
  一个事务可能包含很多语句，即使是一条语句也可能修改许多页面，假如该事务修改的这些页面可能并不相邻，这就意味着在将某个事务修改的Buffer Pool中的页面刷新到磁盘 时，需要进行很多的随机IO，随机IO比顺序IO要慢，尤其对于传统的机械硬盘来说

另一个解决的思路 ：我们只是想让已经提交了的事务对数据库中数据所做的修改永久生效，即使后来系统崩溃，在重启后也能把这种修改恢复出来。所以我们其实没有必要在每次事务提交时就把该事务在内存中修改过的全部页面刷新到磁盘，只需要<font color=orchid>把修改了哪些东西记录一下就好，记录这些的日志文件就是redo日志。</font>

<font color=red>好处</font>

1. 降低刷盘频率；
2. 占用空间非常小

<font color=red>特点</font>

- 顺序写入磁盘

在执行事务的过程中，每执行一条语句，就可能产生若干条redo日志，这些日志是按照 产生的顺序写入磁盘的也就是使用顺序IO，效率比随机IO快。

- 事务执行过程中，redo log不断记录

redo log 跟bin log 的区别，redo log 是 存储引擎层 产生的，而bin log是数据层产生的。假设一个事务，对表做10万行的记录插入，在这个过程中，一直不断的往redo log顺序记录，而bin log不会记录，直到这个事务提交，才会一次写入到bin log文件中。

<mark>redo的组成</mark>

- <font color=orchid>重做日志的缓冲</font> (redo log buffer) ，保存在内存中，是易失的。

  redo log buffer 大小，默认 16M ，最大值是4096M，最小值为1M

  ```sql
  show variables like '%innodb_log_buffer_size%';
  ```

- <font color=orchid>重做日志文件 </font>(redo log file) ，保存在硬盘中，是持久的，默认位置在数据目录下

  

<mark>redo刷盘策略及流程</mark>



![image-20230130200920512](http://images.xyzzs.top/image/image-20230130200920512.png_char)



注意，redo log buffer刷盘到redo log file的过程并不是真正的刷到磁盘中去，只是刷入到 <font color=orchid>文件系统缓存（page cache）</font>中去（这是现代操作系统为了提高文件写入效率做的一个优化），真正的写入会交给系统自己来决定（比如page cache足够大了）。那么对于InnoDB来说就存在一个问题，如果交给系统来同步，同样如果系统宕机，那么数据也丢失了（虽然整个系统宕机的概率还是比较小的）。

针对这种情况，InnoDB给出 <font color=orchid>innodb_flush_log_at_trx_commit</font> 参数，该参数控制 commit提交事务时，如何将 redo log buffer 中的日志刷新到 redo log file 中。它支持三种策略：

- 设置为0 ：表示每次事务提交时<font color=orchid>不进行刷盘操作</font>。（系统默认master thread<font color=orchid>每隔1s</font>进行一次redo log buffer刷新到page cache，并刷盘到redo log file）
- 设置为1 ：表示每次事务<font color=orchid>提交时都将redo log buffer刷新到page cache，并刷盘到redo log file</font>，刷盘操作（ 默认值 ）
- 设置为2 ：表示每次事务提交时都<font color=orchid>只把 redo log buffer 内容写入 page cache</font>，不进行同步。由<font color=orchid>os自己决定（一般也是一秒）</font>什么时候把page cache同步到磁盘文件。要求服务器不能宕机，这个风险很难去完全规避。

### undo日志

回滚日志：回滚行记录到某个特定版本，用来保证事务的`原子性、一致性`。

<mark>作用</mark>

1. 回滚数据
2. MVCC

<mark>回滚段中的数据分类</mark>

1. 未提交的回滚数据(uncommitted undo information)
2. 已经提交但未过期的回滚数据(committed undo information)
3. 事务已经提交并过期的数据(expired undo information)

<mark>分类</mark>

- insert undo log

  insert undo log是指在insert操作中产生的undo log。因为insert操作的记录，只对事务本身可见，对其他事务不可见(这是事务隔离性的要求)，故该undo log可以在事务提交后直接删除。不需要进行purge操作。

- update undo log

  update undo log记录的是对delete 和update操作产生的undo log。该undo log可能需要提供MVCC机制，因此不能在事务提交时就进行删除。提交时放入undo log链表，等待purge线程进行最后的删除。

### MVCC

隐藏字段、undo log 、readview

<mark>ReadView</mark>

1. trx_ids：生成 ReadView 时当前系统中活跃的事务 Id 列表，就是还未执行事务提交的。

2. up_limit_id：低水位，取 trx_ids 中最小的那个，trx_id 小于该值都能看到。
3. low_limit_id：高水位，生成 ReadView 时系统将要分配给下一个事务的id值，trx_id 大于等于该值都不能看到。

4. creator_trx_id：生成该 ReadView 的事务的事务 Id。

<mark>MVCC整体操作流程</mark>

有了这个ReadView，这样在访问某条记录时，只需要按照下边的步骤判断记录的某个版本是否可见：

1）如果被访问版本的trx_id与ReadView中的creator_trx_id值相同，意味着当前事务在访问它自己修改过的记录，所以该版本可以被当前事务访问。

2）如果被访问版本的trx_id小于ReadView中的up_limit_id值，表明生成该版本的事务在当前事务生成ReadView前已经提交，所以该版本可以被当前事务访问。

3）如果被访问版本的trx_id大于ReadView中的low_limit_id值，表明生成该版本的事务在当前事务生成ReadView后才开启，所以该版本不可以被当前事务访问。

4）如果被访问版本的trx_id属性值在ReadView的up_limit_id和low_limit_id之间，那就需要判断一下trx_id属性值是不是在trx_ids列表中。如果在，说明创建ReadView时生成该版本的事务还是活跃的，该版本不可以被访问；如果不在，说明创建ReadView时生成该版本的事务已经被提交，该版本可以被访问。

在进行判断时，首先会拿记录的最新版本来比较，如果该版本无法被当前事务看到，则通过记录的 DB_ROLL_PTR 找到上一个版本，重新进行比较，直到找到一个能被当前事务看到的版本。



读已提交隔离级别下，每次读，都生成新的readView

可重复读隔离级别下，只有第一次读生成readView



一个事务去访问记录的时候，除了自己的更新记录总是可见之外，还有这几种情况：

- 如果记录的 trx_id 值<font color=red>**小于**</font> Read View 中的 `min_trx_id` 值，表示这个版本的记录是在创建 Read View **前**已经提交的事务生成的，所以该版本的记录对当前事务**<font color=red>可见</font>**。
- 如果记录的 trx_id 值**<font color=red>大于等于</font>** Read View 中的 `max_trx_id` 值，表示这个版本的记录是在创建 Read View **后**才启动的事务生成的，所以该版本的记录对当前事务**<font color=red>不可见</font>**。
- 如果记录的 trx_id 值在 Read View 的 min_trx_id 和 max_trx_id之间，需要判断 trx_id 是否在 m_ids 列表中：
  - 如果记录的 trx_id **<font color=red>在</font>** `m_ids` 列表中，表示生成该版本记录的活跃事务依然活跃着（还没提交事务），所以该版本的记录对当前事务**<font color=red>不可见</font>**。
  - 如果记录的 trx_id **<font color=red>不在</font>** `m_ids`列表中，表示生成该版本记录的活跃事务已经被提交，所以该版本的记录对当前事务**<font color=red>可见</font>**。

**这种通过「版本链」来控制并发事务访问同一个记录时的行为就叫 MVCC（多版本并发控制）。**





## 锁

```java
SHOW OPEN TABLES
```

锁的不同角度分类

###  对数据操作类型划分

共享锁/S锁

```sql
select * from account lock in share mode;
```

排他锁/X锁

```sql
select * from acount for update;
```

### 锁粒度划分

表锁

①表级别的s锁、x锁

```sql
LOCK TABLES t READ; InnoDB存储引擎会对表 t 加表级别的 S锁。
LOCK TABLES t WRITE; InnoDB存储引擎会对表 t 加表级别的 X锁。

unlock tables;
```

![img](http://images.xyzzs.top/image/1654479682586-b8532ce8-5eff-45a3-a542-733bf5ff9e63.png_char)

②意向锁

![img](http://images.xyzzs.top/image/1654519444811-b10c933d-7bd8-435f-82dc-9ce87425e170.png_char)

③自增锁



④元数据锁





行锁

①记录锁（record locks）

记录锁是有S锁和X锁之分的，称之为 S型记录锁 和 X型记录锁 。
当一个事务获取了一条记录的S型记录锁后，其他事务也可以继续获取该记录的S型记录锁，但不可
以继续获取X型记录锁；
当一个事务获取了一条记录的X型记录锁后，其他事务既不可以继续获取该记录的S型记录锁，也不
可以继续获取X型记录锁。 


②间隙锁（Gap locks）

仅仅是为了防止插入幻影记录而提出

```sql
select * from performance_schema.data_locks\G
```

③临建锁(next-key Locks)

next-key锁本质就是记录锁和gap锁的合体，既能保护该条数据，又能阻止别的事务将新记录插入被保护记录前边的间隙

④插入意向锁





页锁



### 对待锁的态度划分

悲观锁



乐观锁



### 加锁方式划分

显式锁

隐式锁



其他锁

全局锁

死锁

### 锁的内存结构







## 六大日志文件

### 二进制日志—binlog

记录所有更改数据的语句，可以用于主从服务器之间的数据同步，以及服务器遇到故障时数据的无损失恢复。

binlog即binary log，二进制日志文件，也叫作变更日志（update log）。它记录了数据库所有执行的DDL 和 DML 等数据库更新事件的语句，但是不包含没有修改任何数据的语句（如数据查询语句select、show等）。

binlog主要应用场景：一是用于 数据恢复；二是用于 数据复制



<mark>binlog的写入机制</mark>

![image-20230130223230709](http://images.xyzzs.top/image/image-20230130223230709.png_char)

write和fsync的时机，可以由参数 sync_binlog 控制

- 默认是 0 。为0的时候，表示每次提交事务都只write，由系统自行判断什么时候执行fsync。虽然性能得到提升，但是机器宕机，page cache里面的binglog 会丢失。

- 可以设置为 1 ，表示每次提交事务都会执行fsync，就如同**redo log** **刷盘流程**一样。
- 可以设置为N(N>1)，表示每次提交事务都write，但累积N个事务后才fsync。在出现IO瓶颈的场景里，将sync_binlog设置成一个比较大的值，可以提升性能。同样的，如果机器宕机，会丢失最近N个事务的binlog日志。

### 慢查询日志

记录所有执行时间超过long_query_time的所有查询，方便我们对查询进行优化。

### 通用查询日志

通用查询日志用来 记录用户的所有操作 ，包括启动和关闭MySQL服务、所有用户的连接开始时间和截止时间、发给 MySQL 数据库服务器的所有 SQL 指令等。我们的数据发生异常时，**查看通用查询日志，还原操作时的具体场景**，可以帮助我们准确定位问题。

### 错误日志

记录MySQL服务的启动、运行或停止MySQL服务时出现的问题，方便我们了解服务器的状态，从而对服务器进行维护。

在MySQL数据库中，错误日志功能是 默认开启 的。而且，错误日志 无法被禁止 。

默认情况下，错误日志存储在MySQL数据库的数据文件夹下，名称默认为 `mysqld.log `（Linux系统）或`hostname.err` （mac系统）。如果需要制定文件名，则需要在my.cnf或者my.ini中做如下配置：

```sql
[mysqld]
log-error=[path/[filename]] #path为日志文件所在的目录路径，filename为日志文件名
```

### 中继日志——8.0新增

只在从服务器上存在

![img](http://images.xyzzs.top/image/1672330613087-71bed4f4-afb6-4019-80c4-96ad9fc36fa1.png_char)

主从复制原理图

![img](http://images.xyzzs.top/image/1672331272987-00f791ff-e5a4-444c-be4a-0ad2b5a0d293.png_char)



### 数据定义语句日志——8.0新增





## 主从复制

### 同步数据一致性问题

如何解决一致性问题

1. 异步复制
2. 半同步复制：可配置只需收到N个从库响应ack确认，即可
3. 组复制：paxos



<!--

数据库备份与恢复

数据库其他调优策略

淘宝数据库，主键如何设计的？

-->
