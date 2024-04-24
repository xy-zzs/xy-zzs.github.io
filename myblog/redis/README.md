# Redis导航栏

## 数据结构与RedisObject

### ①简单动态字符串SDS

Redis的底层是用C语言实现的，但C语言字符串存在很多问题：

- 获取字符串长度的需要通过运算

- 非字符串安全

- 不可修改

因此Redis构建了一种新的字符串结构，称为简单动态字符串（Simple Dynamic String）简称SDS。

其中SDS是一个结构体，源码如下：

```c
struct __attribute__((__packed__)) sdshdr8 {
    uint8_t len;	//buf中已保存的字符串字节数，不包含结束标识
    uint8_t alloc;	//buf申请的总字节数，不包含结束标识
    unsigned char flags;  //不同的SDS的头类型，用来控制SDS的头大小，对应关系如下SDS_TYPE定义
    char buf[];
}

#define SDS_TYPE_5  0
#define SDS_TYPE_8  1
#define SDS_TYPE_16 2
#define SDS_TYPE_32 3
#define SDS_TYPE_64 4
```

example：一个"hello"字符串的SDS结构如下

![image-20230122131601805](http://images.xyzzs.top/image/image-20230122131601805.png_char)



<mark>内存预分配</mark>

SDS之所以叫做动态字符串，是因为它具备动态扩容的能力，例如一个内容为"hi"的SDS；

假如我们要给SDS追加一段字符串",zzs"，这里首先会申请新内存空间：

- 如果新字符串小于1M，则新空间为扩展后字符串长度的两倍+1；
- 如果新字符串大于1M，则新空间为扩展后字符串长度+1M+1，称为***内存预分配***

![image-20230122133014915](http://images.xyzzs.top/image/image-20230122133014915.png_char)



<mark>优点</mark>

1. 获取字符串长度的时间复杂度为O(1)
2. 支持动态扩容
3. 减少内存分配次数
4. 二进制安全



### ②IntSet—整数数组

IntSet是Redis中set集合的一种实现方式，基于整数数组来实现，并且具备长度可变、有序等特征。

```c
typedef struct intset {
    uint32_t encoding;	//编码方式，支持存放16位、32位、64位整数
    uint32_t length;	//元素个数
    int8_t contents[];  //整数集合，保存集合数据
} intset;

#define INTSET_ENC_INT16 (sizeof(int16_t)) //2字节，范围类似java的short
#define INTSET_ENC_INT32 (sizeof(int32_t)) //4字节，范围类似java的int
#define INTSET_ENC_INT64 (sizeof(int64_t)) //8字节，范围类似java的long
```

为了方便查找，Redis会将intset中所有的整数按照升序依次保存再contents数组中，结构如下

![image-20230122135317734](http://images.xyzzs.top/image/image-20230122135317734.png_char)

现在，数组中每个数字都在int16_t范围内，因此采用的编码方式是INTSET_ENC_INT16，占用的字节大小为：

- encoding：4 字节
- length：4 字节
- contents：2 字节 * 3 = 6 字节

<mark>IntSet升级</mark>

假设有一个intset，元素为{7,18,24}，因此采用的编码是<font color=blue>INTSET_ENC_INT16</font>，则每个整数占2字节

![image-20230122142031230](http://images.xyzzs.top/image/image-20230122142031230.png_char)

现在，向该数组中添加一个数字：50000 ，这个数字超过了int16_t的范围，intset会自动升级编码方式到合适的大小。升级流程如下：

1. 升级编码为INTSET_ENC_INT32，每个整数占4个字节，并按照新的编码方式及元素个数扩容数组
2. 倒序依次将数组中的元素拷贝到扩容的正确位置
3. 将待添加元素放入数组末尾
4. 最后，将intset的encoding属性改为INTSET_ENC_INT32，将length属性改为4

![image-20230122143827719](http://images.xyzzs.top/image/image-20230122143827719.png_char)



<mark>特点</mark>

intset可以看做是特殊的整数数组，具备以下特点：

1. Redis会确保IntSet中的元素唯一、有序
2. 具备类型升级机制，可以节省内存空间
3. 底层采用二分查找方式查询



### ③Dict—字典

Redis是一个键值型的数据库，我们可以根据键实现快速的增删改查，这种关系一般通过Dict实现。

Dict由三部分组成，分别是字典（Dict）、哈希表（DictHashTable），哈希节点（DictEntry）。

```c
typedef struct dict {//字典
    dictType *type;		//dict类型，内置不同的hash函数
    void *privdata;		//私有数据，在做特殊hash运算时用
    dictht ht[2];		//一个Dict包含两个哈希表，其中一个是当前数据，另一个一般是空，rehash时使用
    long rehashidx;		/*rehashidxrehash的进度，-1表示未进行 */
    int16_t pauserehash;//rehash是否暂停，1则暂停，0继续
} dict;

typedef struct dictht {//哈希表
    dictEntry **table;		//entry数组，保存的是指向entry的指针
    unsigned long size;		//哈希表的大小
    unsigned long sizemask;	//哈希表的大小的掩码，总等于size-1，用于哈希运算，按位与& 效率高
    unsigned long used;		//entry个数，因为节点可以形成链表，所以used可能会大于size
} dictht;

typedef struct dictEntry {//哈希节点
    void *key;	//键
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;	//值
    struct dictEntry *next;
} dictEntry;

```

<mark>Dict的结构</mark>

- 类似 Java 的 HashTable , 底层是数组加链表来解决哈希冲突
- Dict 包含两个哈希表，ht[0]平常用，ht[1]用来rehash

![image-20230122151743360](http://images.xyzzs.top/image/image-20230122151743360.png_char)



<mark>Dict的扩容</mark>

Dict的HashTable就是数组结合单向链表的实现，当集合中元素较多时，必然导致哈希冲突增多，链表过长，则查询效率会大大降低。

Dict在每次新增键值对时都会检查负载因子（LoadFactory = used / size）,满足以下两种情况会触发***哈希表扩容***

- 哈希表的LoadFactory >= 1,并且服务器没有执行`BGSAVE` 或者`BGREWRITEAOF`等后台进程——因为类似命令对后台CPU使用是比较高的，影响性能
- 哈希表LoadFactory > 5——此时链表应该是比较长，也比较影响性能

<mark>Dict的收缩</mark>

Dict除了扩容外，每次删除元素时，也会对负载因子做检查，档loadFactory < 0.1 时，会做哈希表收缩；

***Dict伸缩小结***

- 当 LoadFactory 大于 5或者 LoadFactory 大于1 并且没有子进程任务时，Dict扩容；
- 当LoadFactory 小于 0.1 时，Dict 收缩；
- 扩容大小为第一个大于等于used + 1 的 2^n；
- 收缩大小为第一个大于等于used 的 2^n；
- Dict采用渐进式rehash，每次访问Dict时执行一次rehash；
- rehash时ht[0]只减不增，新增操作只在ht[1]执行，其他操作在两个哈希表；



<mark><font color=red size=6>渐进式rehash</font></mark>

<!-- 背这六大步骤 -->

不管扩容还是缩容，哈希表的大小size必定会变，导致sizemark变化，而key的查询与sizemark（参与哈希运算）有关，因此必须对哈希表的每一个key重新计算索引，插入新的哈希表，这个过程成为***rehash***，过程如下：

1. 计算hash的realSize，取决于当前要做的扩容还是收缩：
   - 如果是扩容，则新size为第一个大于等于dict.ht[0].used+1的`2^n`- 
   - 如果是收缩，则新size为第一个大于等于dict.ht[0].used的`2^n` （不得小于4）
2. 按照新的realsize申请内存空间，创建dictht，并赋值给dict[1]
3. 设置dict.rehashidx = 0 ,表示开始rehash
4. <font color=Orchid>每次执行新增、查询、修改、删除操作时，都检查一下dict.rehashidx是否大于-1，如果是则将dict.ht[0].table[rehashidx]的entry链表rehash到dict[1]并将rehash++。直至dict.ht[0]中的所有数据rehash到dict.ht[1]。</font>在rehash过程中，新增操作，则直接写入ht[1]，查询、修改和删除则会在dict[0]和dict[1]依次查找并执行。这样可以确保ht[0]的数据只减不增，随着rehash最终为空
5. 将dict.ht[1]赋值给dict.ht[0]，给dict.ht[1]初始化为空哈希表，释放原来的dict.ht[0]的内存
6. 将rehashidx赋值为-1，代表rehash结束



### ④ZipList

<mark>ZipList的结构</mark>

![image-20230122165636300](http://images.xyzzs.top/image/image-20230122165636300.png_char)

![img](http://images.xyzzs.top/image/1672572686250-43cefc51-74ef-4f95-bac1-b02267383d4c.png_char)

ZipList是一种特殊的`双端链表`，由一系列特殊编码的连续内存块组成，可以在任意一端进行压入、弹出操作，并且该操作的时间复杂度为O(1)。

<table>
    <tr>
        <td bgcolor=red>属性</td>
        <td bgcolor=red>类型</td>
        <td bgcolor=red>长度</td>
        <td bgcolor=red>用途</td>
    </tr>
    <tr>
    	<td>zlbytes</td>
        <td>uint32_t</td>
        <td>4字节</td>
        <td>记录整个压缩列表占用的内存字节数</td>
    </tr>
    <tr>
    	<td>zltail</td>
        <td>uint32_t</td>
        <td>4字节</td>
        <td>记录压缩列表表尾节点距离压缩列表的起始地址有多少字节，通过这个偏移量，可以确定表尾节点的地址。</td>
    </tr>
    <tr>
    	<td>zllen</td>
        <td>uint16_t</td>
        <td>2字节</td>
        <td>记录了压缩列表包含的节点数量。最大值为uint16_max（65534），如果超过这个值，此处会记录65535，但节点的真实数量需要遍历整个压缩列表才能计算得出。因此ziplist不介意存过多数据</td>
    </tr>
    <tr>
    	<td>entry</td>
        <td>列表节点</td>
        <td>不定</td>
        <td>压缩列表包含的各个节点，节点的长度由节点保存的内容决定</td>
    </tr>
    <tr>
    	<td>zlend</td>
        <td>uint8_t</td>
        <td>1</td>
        <td> 特殊值0xFF（十进制255），用于标记压缩列表的末端</td>
    </tr>
</table>

<mark>ZipListEntry</mark>

ZipList中的Entry并不像普通链表那样记录前后节点的指针，因为记录两个指针要占用16个字节，浪费内存；而是采用如下结构：

![image-20230122182941880](http://images.xyzzs.top/image/image-20230122182941880.png_char)

- previous_entry_length: 前一节点的长度，占1个或5个字节；<font color=Orchid>用于倒序遍历</font>
  - 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值
  - 如果前一节点的长度大于254字节，则采用5个字节来保存这个长度值，第一个字节为0xFE，后四个字节才是真实长度数据
- encoding：编码属性，记录content的数据类型（字符串还是整数）以及长度，占用1个、2个或5个字；<font color=Orchid>用于正序遍历</font>
- contents：负责保存节点的数据，可以是字符串或整数



![img](http://images.xyzzs.top/image/1672573411313-8b9048b4-f2a9-403d-ae93-acfdd2491764.png_char)



![img](http://images.xyzzs.top/image/1672573831777-b96f8724-444e-46ea-80e4-87486ced62c8.png_char)



<mark>Encoding编码属性</mark>

ZipListEntry中的encoding编码分为字符串和整数两种：

- 字符串：如果encoding是以00、01、10开头，则证明content是字符串

  | 编码                                                         | 编码长度 | 字符串大小                              |
  | ------------------------------------------------------------ | -------- | --------------------------------------- |
  | \|00<font color=Orchid>pppppp\|</font>                       | 1 bytes  | <= 63 bytes，6个比特位记录长度          |
  | \|01<font color=Orchid>pppppp\|qqqqqqqq\|</font>             | 2 bytes  | <= 16383 bytes，14个比特位记录长度      |
  | \|10000000<font color=Orchid>\|qqqqqqqq\|rrrrrrrr\|ssssssss\|tttttttt</font> | 5 bytes  | <= 4294967295 bytes，32个比特位记录长度 |

- 整数：如果encoding是以11开头，则说明content是整数，且encoding固定只占用一个字节

  | 编码     | 编码长度 | 整数类型                                                     |
  | -------- | -------- | ------------------------------------------------------------ |
  | 11000000 | 1 bytes  | int16_t(2 bytes)                                             |
  | 11010000 | 1 bytes  | int32_t(4 bytes)                                             |
  | 11100000 | 1 bytes  | int64_t(8 bytes)                                             |
  | 11110000 | 1 bytes  | 24位有符号整数(3 bytes)                                      |
  | 11111110 | 1 bytes  | 8位有符号整数(1 bytes)                                       |
  | 1111xxxx | 1 bytes  | 直接在xxxx位置保存数值，范围从0001~1101，减1后结果为实际值；<br/>  不再需要content |



![img](http://images.xyzzs.top/image/1672574517911-630ccdf9-60ce-4185-bdfc-026981d4e31e.png_char)

<mark>ZipList的连锁更新问题</mark>

ZipList的每个Entry都包含previous_entry_length来记录上一个节点的大小，长度是1或5个字节

- 如果前一节点的长度小于254字节，则采用1个字节来保存这个长度值
- 如果前一节点的长度大于等于254字节，则采用5个字节来保存这个长度值，第一个字节为0xfe，后四个字节才是真实长度数据。

假设我们有N个<font color=Orchid>连续的，长度为250~253字节之间</font>的entry，因此entry的previous_entry_length属性用1个字节即可表示。现在头节点插入一个数据大于254字节，导致第二个节点的previous_entry_length从1个字节升到5个字节，第二个导致第三个，依次类推；ZipList这种特殊情况下产生的连续多次空间扩展操作称为**连锁更新**，新增、删除都可能导致连锁更新的发生。

<mark>ZipList特性</mark>

1. 压缩列表可以看做一种连续内存空间的"双向链表"
2. 列表的节点之间不是通过指针连接，而是记录上一节点和本节点长度来寻址，内存占用较低
3. 如果列表数据过多，导致链表过长，可能影响查询性能
4. 增或删较大数据时有可能发生连续更新问题

### ⑤QuickList

问题1： ZipList 虽然节省内存，但申请内存必须是连续空间，如果内存占用较多，申请效率很低，怎木办？

为了缓解这个问题，我们必须限制 ZipList 的长度和entry大小

问题2：但是我们就是要存储大量数据，超出了 ZipList 最佳上限该怎么办？

我们可以创建多个 ZipList 来分片存储数据。

问题3：数据拆分后比价分散，比方便管理和查找，这多个 ZipList 如何建立联系？

Redis 在3.2版本引用了新的数据结构 QuickList，它是一个双端链表，只不过链表中的每个 节点都是一个ZipList。

<mark>QuickList总体结构</mark>

![image-20230122192805321](http://images.xyzzs.top/image/image-20230122192805321.png_char)

<mark>避免QuickList过大</mark>

1. <font color=red>list-max-ziplist-size配置</font>

   为了避免QuickList中的每个ZipList的entry过多，Redis提供了一个配置项：list-max-ziplist-size来限制。

   - 如果值为正，则代表ZipList的允许的entry个数的最大值；

   - 如果值为负，则代表ZipList的最大内存大小，分5种情况：

     1. -1：每个ZipList的内存占用不能超过4kb
     2. -2：每个ZipList的内存占用不能超过8kb（默认值）
     3. -3：每个ZipList的内存占用不能超过16kb
     4. -4：每个ZipList的内存占用不能超过32kb
     5. -5：每个ZipList的内存占用不能超过64kb

     ```text
     config get list-max-ziplist-size
     ```

     ![image-20230122193828142](http://images.xyzzs.top/image/image-20230122193828142.png_char)

2. <font color=red>QuickList压缩</font>

​		除了控制ZipList的大小，QuickList还可以对节点的ZipList做压缩。通过配置项list-compress-depth来控制。因为链表一般都是从首尾访问较多，所以首尾是不压缩的。这个参数是控制首尾不压缩的节点个数：

- 0：特殊值，代表不压缩（默认）
- 1：表示QuickList的的首尾各有1个节点不压缩，中间节点压缩
- 2：表示QuickList的的首尾各有2个节点不压缩，中间节点压缩
- 以此类推

![image-20230122195421913](http://images.xyzzs.top/image/image-20230122195421913.png_char)

<mark>结构及源码</mark>

```c
typedef struct quicklist {
    quicklistNode *head;
    quicklistNode *tail;
    unsigned long count;        /* total count of all entries in all ziplists */
    unsigned long len;          /* number of quicklistNodes */
    int fill : QL_FILL_BITS;              /* fill factor for individual nodes */
    unsigned int compress : QL_COMP_BITS; /* depth of end nodes not to compress;0=off */
    unsigned int bookmark_count: QL_BM_BITS;
    quicklistBookmark bookmarks[];
} quicklist;

typedef struct quicklistNode {
    struct quicklistNode *prev;
    struct quicklistNode *next;
    unsigned char *zl;
    unsigned int sz;             /* ziplist size in bytes */
    unsigned int count : 16;     /* count of items in ziplist */
    unsigned int encoding : 2;   /* RAW==1 or LZF==2 */
    unsigned int container : 2;  /* NONE==1 or ZIPLIST==2 */
    unsigned int recompress : 1; /* was this node previous compressed? */
    unsigned int attempted_compress : 1; /* node can't compress; too small */
    unsigned int extra : 10; /* more bits to steal for future usage */
} quicklistNode;
```

![image-20230122200438739](http://images.xyzzs.top/image/image-20230122200438739.png_char)

<mark>特点</mark>

- 是一个节点为ZipList的双端链表
- 节点采用ZipList，解决了传统链表的内存占用问题
- 控制了ZipList大小，解决连续内存空间申请效率问题
- 中间节点可以压缩，进一步节省了内存



### ⑥SkipList

SkipList首先是链表，但与传统链表相比有几点差异：

- 元素按照升级排列存储
- 节点可能包含多个指针（最多有32级），指针跨度不同

![image-20230122202833688](http://images.xyzzs.top/image/image-20230122202833688.png_char)



<mark>特点</mark>

- 跳跃表是一个双向链表，每个节点都包含score和ele值
- 节点按照score值排序，score值一样则按照ele字典排序
- 每个节点都可以包含多层指针，层数是1到32之间的随机数（根据算法去推测）
- 不同层指针到下一个节点的跨度不同，层级越高，跨度越大
- 增删改查效率与红黑树基本一直，实现却更简单



### RedisObject

Redis中的任意数据类型的键和值都会被封装为一个RedisObject，也叫做Redis对象

![image-20230122204056965](http://images.xyzzs.top/image/image-20230122204056965.png_char)

Redis中会根据存储的数据类型不同，选择不同的编码方式，共包含11种不同类型：

| 编号 | 编码方式                | 说明                   |
| ---- | ----------------------- | ---------------------- |
| 0    | OBJ_ENCODING_RAW        | raw编码动态字符串      |
| 1    | OBJ_ENCODING_INT        | long类型的整数的字符串 |
| 2    | OBJ_ENCODING_HT         | hash表（字典dict）     |
| 3    | OBJ_ENCODING_ZIPMAP     | 已废弃                 |
| 4    | OBJ_ENCODING_LINKEDLIST | 双端链表               |
| 5    | OBJ_ENCODING_ZIPLIST    | 压缩列表啊             |
| 6    | OBJ_ENCODING_INTSET     | 整数集合               |
| 7    | OBJ_ENCODING_SKIPLIST   | 跳表                   |
| 8    | OBJ_ENCODING_EMBSTR     | embstr的动态字符串     |
| 9    | OBJ_ENCODING_QUICKLIST  | 快速列表               |
| 10   | OBJ_ENCODING_STREAM     | Stream流               |

Redis中会根据存储的数据类型不同，选择不同的编码方式。每种数据类型使用的编码方式 如下：

| 数据类型   | 编码方式                                             |
| ---------- | ---------------------------------------------------- |
| OBJ_STRING | int、embstr、raw                                     |
| OBJ_LIST   | LinkedList和ZipList（3.2之前）、QuickList（3.2以后） |
| OBJ_SET    | intset、HT                                           |
| OBJ_ZSET   | ZipList、HT、SkipList                                |
| OBJ_HASH   | ZipList、HT                                          |



## 五种常用数据类型

### 底层实现——String

String是Redis中最常见的数据存储类型：

1. 其基本编码方式是<mark> RAW </mark>，基于简单动态字符串 SDS 实现，<font color=Orchid>存储上限 512 MB </font>。

   ![image-20230123104322060](http://images.xyzzs.top/image/image-20230123104322060.png_char)

2. 如果存储的<font color=Orchid>SDS长度小于44字节 </font>，则采用<mark>EMBSTR编码</mark>，此时 objecthead 和 SDS 是一段连续空间。申请内存只需要调用一次内存分配函数，效率更高。

   ![image-20230123104423346](http://images.xyzzs.top/image/image-20230123104423346.png_char)

3. 如果<font color=Orchid>存储的字符串是整数值</font>，并且大小在LONG_MAX范围内，则会采用<mark>INT编码</mark>：直接将数据保存再RedisObject的ptr指针位置（刚好8字节），不再需要SDS。

   ![image-20230123104535027](http://images.xyzzs.top/image/image-20230123104535027.png_char)

客户端验证

![image-20230123105908327](http://images.xyzzs.top/image/image-20230123105908327.png_char)

### 底层实现——List

List类型可以从队首、队尾操作列表中的元素

<img src="http://images.xyzzs.top/image/image-20230123113427574.png_char" alt="image-20230123113427574" style="zoom: 45%;" />

分析：哪种数据更能满足以上特征？

- LinkedList：普通链表，可以从双端访问，内存占用较高，内存碎片较多
- ZipList：压缩列表，可以从双端访问，内存占用较低，存储上限低
- QuickList：可以从双端访问，内存占用较低，包含多个ZipList，存储上限高

<mark>List底层实现</mark>

- 在3.2版本之前，Redis采用ZipList和LinkedList来实现List，当元素数量小于512并且元素大小小于64字节时采用ZipList编码，超过则采用LinkedList编码
- 在3.2版本后，Redis统一采用<font color=Orchid>QuickList</font>来实现List

![image-20230123122029937](http://images.xyzzs.top/image/image-20230123122029937.png_char)

### 底层实现——Set

Set是Redis的中单列集合，满足以下特点：

- 不保证有序性
- 保证元素唯一（可以判断元素是否存在）
- 求交集、并集、差集，查询效率要求高

<img src="http://images.xyzzs.top/image/image-20230123123941680.png_char" alt="image-20230123123941680" style="zoom:50%;" />



<mark>Set底层实现</mark>

1. 为了保证查询效率和唯一性，Set采用<font color=red>HT编码（Dict）</font>。Dict中的key用来存储元素，value统一为`null`

2. 当存储的<font color=Orchid>所有数据都是整数</font>，并且元素数量不超过<font color=Orchid>set-max-intset-entries</font>时（默认512），Set会采用<font color=red>IntSet编码</font>，节省内存；如果插入一个非整数，升级到dict类型

![image-20230123125355831](http://images.xyzzs.top/image/image-20230123125355831.png_char)

### 底层实现——ZSet

ZSet也就是SortedSet，其中每一个元素都需要指定一个score值和member值，且满足以下特征：

- 可以根据score值排序（有序）

- member必须唯一（键唯一）

- 可以根据member查询分数（键值存储，效率）

  ![image-20230123130324355](http://images.xyzzs.top/image/image-20230123130324355.png_char_char)

回顾：

- SkipList：可排序，并且可以键值存储score和ele值，但<font color=Orchid>键不唯一</font>
- HT（Dict）：可以键值存储，满足键需唯一，且查询效率高，但<font color=Orchid>不可排序</font>

小孩子才做选择，我们全都要：

1. <font color=red>采用 Dict + SkipList 存储</font>

   - Dict 来实现键值存储，键的唯一

   - SkipList 实现可排序

     <img src="http://images.xyzzs.top/image/image-20230123132144199.png_char_char" alt="image-20230123132144199" style="zoom:50%;" />

2. 当<font color=Orchid>元素数量不多时</font>，采用 HT 和 SkipList 的优势并不明显，而且**更耗内存**。因此zset还会<font color=red>采用ZipList结构</font>存储来节省内存，不过需要同时满足以下两个条件：

   - 元素数量小于zset-max-ziplist-entries，默认值128
   - 每个元素都小于zset-max-ziplist-value字节，默认值64

   ZipList本身没有排序功能，而且没有键值对的概念，因此需要有由 zset 通过编码实现：

   :large_blue_diamond:ZipList是联系内存，因此score和element是紧挨在一起的两个entry，element在前，score在后;

   :large_blue_diamond:score越小越接近队首，score越大越接近队尾，按照score值升序排列

   ![](http://images.xyzzs.top/image/image-20230123135653225.png_char_char)

   

```c
typedef struct zset {
    // Dict指针
    dict *dict;
    // SkipList指针
    zskiplist *zsl;
}
```

### 底层实现——Hash

Hash结构与ZSet比价类似：

- 都是键值存储
- 都需要根据键获取值
- 键必须唯一

但也有区别：

ZSet 的键是member，值是score，必须为数字，以此来排序，有序；

hash的键和值都是任意值，无序

因此，Hash底层采用的编码与Zset也基本一直，只需把排序有关的SkipList去掉即可

- Hash结构默认采用ZipList编码，用以节省内存，相邻的两个entry分别保存field和value

- 当数据量较大时，Hash结构会转为HT编码，也就是Dict，触发条件有两

  1. Ziplist中的元素数量超过了<font color=Orchid>hash-max-ziplist-entries</font>（默认512）

  2. Ziplist中的任意entry大小超过了<font color=Orchid>hash-max-ziplist-value</font>（默认64自己）

     ![image-20230123142800925](http://images.xyzzs.top/image/image-20230123142800925.png_char)

![image-20230123142606904](http://images.xyzzs.top/image/image-20230123142606904.png_char)



### 使用场景

1. string
   - 常规key-value缓存应用。
   - 常规计数功能，如粉丝数；点赞
   - 分布式锁。

2. hash
   - 存放结构化数据，如用户信息（昵称、年龄、性别、积分等），对应Java中的 Map<String,map<Object,Object>>
   - 购物车（限小中厂）

3. list
   - 热门博客列表、文章订阅
   - 消息队列系统。使用list可以构建队列系统，比如：将Redis用作日志收集器，多个端点将日志信息写入Redis，然后一个worker统一将所有日志写到磁盘。
   - 秒杀抢购场景

4. set
   - 好友关系，微博粉丝的共同关注、共同喜好、共同好友等
   - 利用唯一性，统计访问网站的所有独立ip 
   - 小程序抽奖
   - 微信朋友圈点赞
   - 微博内好友关注社交关系
   - 推送可能认识的人

5. zset：
   - 排行榜：热搜榜等
   - 优先级队列
   - 对商品进行排序显示

### 常见命令操作

<font color=silver>tips：仅整理一些常用的命令，更多更详细最全命令参考：</font>[请查阅](http://redis.cn/commands.html#)

---

1. String 

   - SET：添加或修改意见存在的一个String类型的键值对

   - GET：根据key获取String类型的value

   - MSET：批量添加多个String类型的键值对

   - MGET：根据多个key获取多个String类型的value

   - INCR：让一个整型的key自增1

   - INCRBY：让一个整型的key自增并指定步长

   - INCRBYFLOAT：让一个浮点类型的数字自增并指定步长

   - SETNX：添加一个String类型的键值对，前提是这个key不存在，否则不执行

   - SETEX：添加一个String类型的键值对，并且指定有效期

   - APPEND：追加一个值到key上

   - STRLEN：获取指定 key的长度

   - KEYS和SCAN：`KEYS`指令会导致线程阻塞一段时间，直到执行完毕，服务才能恢复。`SCAN`采用渐进式遍历的方式来解决`KEYS`命令可能带来的阻塞问题，每次`SCAN`命令的时间复杂度是O(1)，但是要真正实现`KEYS`的功能，需要执行多次`SCAN`。

     scan的缺点：在`SCAN`的过程中如果有键的变化（增加、删除、修改），遍历过程可能会有以下问题：新增的键可能没有遍历到，遍历出了重复的键等情况，也就是说scan并不能保证完整的遍历出来所有的键。

     **警告**: `KEYS` 的速度非常快，但在一个大的数据库中使用它仍然可能造成性能问题，如果你需要从一个数据集中查找特定的 key， 你最好还是用 Redis 的集合结构 Set 来代替。

2. Hash

   - HSET：添加或修改hash类型key的field的值。`HSET myhash field1 "Hello"`
   - HGET：返回 key 指定的哈希集中该字段所关联的值。`HGET myhash field1`
   - HMSET：批量添加多个hash类型的key的field的值。`HMSET myhash field1 "Hello" field2 "World"`
   - HMGET：批量获取多个hash类型的key的field的值。`HMGET myhash field1 field2 nofield`
   - HGETALL：获取一个hash类型的key中的所有field的和value。
   - HKEYS：获取一个hash类型的key中的所有field。
   - HAVLS：获取一个hash类型的key中的所有value。
   - HINCRBY：让一个hash类型key的字段值自增并指定步长。
   - HSETNX：添加一个hash类型的key的field值，前提是这个field不存在，否则不执行。

3. List

   - LPUSH：向列表左侧插入一个或多个元素
   - LPOP：移除并返回列表左侧的第一个元素，没有则返回`nil`
   - RPUSH：向列表右侧插入一个或多个元素
   - RPOP：移除并返回列表右侧的第一个元素，没有则返回`nil`
   - LRANGE：返回一段角标范围内的所有元素
   - BLPOP 和 BRPOP：与 LPOP 和 RPOP 类似，只不过在没有元素时等待指定时间，而不是直接返回`nil`
   - LTRIM：删除索引1到2以外的所有元素`LTRIM numbers 1 2` 
   - LREM：从存于 key 的列表里移除前 count 次出现的值为 value 的元素。 这个 count 参数通过下面几种方式影响这个操作：`LREM numbers 0 2`
     - count < 0, 则从右边开始删除前count个值为value的元素
     - count > 0, 则从左边开始删除前count个值为value的元素
     - count = 0, 则删除所有值为value的元素 

4. Set

   - SADD：向set中添加一个或多个元素
   - SREM：移除set中的指定元素
   - SCARN：返回set中元素的个数
   - SISMEMBER：判断一个元素是否存在set中
   - SMEMBERS：获取set中的所有元素
   - SINTER：交集，都有的
   - SDIFF：差集，一个集合中有，另一个集合中没有
   - SUNION：并集，合并后去掉重复元素

5. Zset

   - ZADD：添加一个或多个元素到sorted set，如果已经存在则更新score值
   - ZREM：删除sorted set中的一个指定元素
   - ZSCORE：获取sorted set中的指定元素的score值
   - ZRANK：获取sorted set中的指定元素的排名
   - ZCARD：获取sorted set中的元素个数
   - ZCOUNT：统计score值在给定范围内的所有元素个数
   - ZINCRBY：让sorted set中的指定元素自增，步长为指定的increment值
   - ZRANGE：按照score排序后，获取指定排名范围内的元素
   - ZRANGBYSCORE：按照score排序后，获取指定score范围内的元素
   - ZDIFF、ZINTER、ZUNION：求差集、交集、并集



## 持久策略

### RDB

redis database backup file（Redis数据备份文件 ）

```java
save:由redis主进程执行rdb，会阻塞所有命令，等待执行完成后返回ok-适用服务宕机、停机之前
bgsave:开启子进程执行rdb，避免主进程受到影响，执行后立即Background saving started-适用使用中
```

![image-20230123205540797](http://images.xyzzs.top/image/image-20230123205540797.png_char)

Redis内部有触发RDB的机制，可以在redis.conf文件中配置：

```text
# 900 秒内如果至少有1个key被修改，则执行bgsave
save 900 1
save 300 10 
save 60  10000

# 表示禁用RDB
save ""
```

RDB其他配置也可以在redis.conf文件中配置：

```text
# 是否压缩，建议不开启，压缩会消耗cpu，磁盘的话不值钱
rdbcompression yes
# RDB文件名
dbfilename dump.rdb
# 文件保存的路径目录
dir ./
```

---

RDB方式bgsave的主要基本流程如下：

1. fork主进程得到一个子进程，共享内存空间
2. 子进程读取内存数据并写入新的RDB文件
3. 用新RDB文件替换旧的RDB文件

fork采用的是copy-on-write技术：

- 当主进程执行读操作时，访问共享内存

- 当主进程执行写操作时，则会拷贝一份数据，执行写操作

  :warning:假设在进行RDB进行过程中，所有数据都有写操作请求，此时占用内存相当于两倍！

![image-20230123213045653](http://images.xyzzs.top/image/image-20230123213045653.png_char)

---

RDB执行时机：

1. 手动

- 执行`SAVE`命令或执行`BGSAVE`命令

2. 被动触发

- 根据配置规则进行自动快照，如`SAVE 300 10`,300秒内至少有10个键被修改则进行快照。
- 如果从节点执行全量复制操作，主节点自动执行bgsave生成RDB文件并发送给从节点。
- 默认情况下执行shutdown命令时，如果没有开启AOF持久化功能则自动执行bgsave。
- 执行debug reload命令重新加载Redis时，也会自动触发save操作。

---

RDB优缺点：

:thumbsup:①RDB 在恢复大数据集时的速度比 AOF 的恢复速度要快。

②占用空间很小，它保存了 Redis 某个时间点的数据集，很适合用于做备份。

③适用于灾难恢复，它只有一个文件，并且内容都非常紧凑，可以（在加密后）将它传送到别的数据中心。

:thumbsdown:① RDB 执行间隔时间长，两次 RDB 之间写入数据有丢失的风险；

​		② fork 子进程、压缩、写出 RDB 文件都比较耗时



### AOF

append only file（追加文件）

AOF默认是关闭的，需要修改redis.conf配置文件来开启AOF

```text
# 是否开启AOF功能，默认是no
appendonly yes
# AOF文件的名称
appendfilename "appendonly.aof"
```

AOF记录命令的频率也可以通过redis.conf文件来配置

```java
# 表示每执行一次写命令，立即记录到AOF文件
appendfsync always
# 写命令执行完先放入AOF缓冲器，然后表示每隔1秒将缓冲区数据写到AOF文件，是默认方案
appendfsync everysec 
# 写命令执行完现放入AOF缓冲区，由操作系统决定何时将缓冲区内容写回磁盘
appendfsync no
```

| 配置项   | 刷盘实际     | 优点                   | 缺点                         |
| -------- | ------------ | ---------------------- | ---------------------------- |
| Always   | 同步刷盘     | 可靠性高，几乎不丢数据 | 性能开销大                   |
| everysec | 每秒刷盘     | 性能适中               | 最多丢失1秒数据              |
| no       | 操作系统控制 | 性能最佳               | 可靠性较差，可能丢失大量数据 |

Redis处理的每一个写命令都会记录在AOF文件中

- everysec（默认）: 每秒调用 fsync, Redis 性能和数据安全性适
- always: 在每次写入 appendonly 日志之后调用 fsync，速度最慢但是数据安全性最高。

- no: 不调用 fsync, 让操作系统在需要时刷新数据，速度最快。



因为是记录命令，AOF文件会比RDB文件大的多。而且AOF会记录对同一个key的多次写操作，但只有最后一次写操作才有意义。通过<font color=Orchid>bgrewriteaof</font>命令，可以让AOF文件执行重写功能，用最少的命令达到相同效果，既节省空间，也提升了恢复效率。

<img src="http://images.xyzzs.top/image/image-20230123234111639.png_char" alt="image-20230123234111639" style="zoom:50%;" />

Redis也会在触发阈值时自动去重写AOF文件。阈值也可以在redis.conf中配置：

````text
#开启：AOF 重写由两个参数共同控制，auto-aof-rewrite-percentage 和 auto-aof-rewrite-min-size，同时满足这两个条件，则触发 AOF 后台重写 BGREWRITEAOF。
# AOF 文件比上次文件，增长超过多少百分比则触发重写
auto-aof-rewrite-percentage 100
# AOF文件体积最小多大以上才触发重写
auto-aof-rewrite-min-size 64mb

# 关闭：auto-aof-rewrite-percentage 0，指定0的百分比，以禁用自动AOF重写功能。
auto-aof-rewrite-percentage 0
````

同时满足这两个条件

假设 AOF 的日志现在 128mb ，如果发现增长的比例，超过了之前的100%，即 256 mb ，就可能会去触发一次rewrite，但是此时还要去跟 min-size ：64 mb 去比较， 256 mb  >  64 mb ，才会去触发rewrite

---

AOF破损文件的修复：

如果redis在append数据到AOF文件时，机器宕机了，可能会导致AOF文件破损

用redis-check-aof --fix命令来修复破损的AOF文件

---

两种方式对比

|                | RDB                                          | AOF                                                      |
| -------------- | -------------------------------------------- | -------------------------------------------------------- |
| 持久化方式     | 定时对整个内存做快照                         | 记录每一次执行的命令                                     |
| 数据完整性     | 不完整，两次备份之间会丢失                   | 相对完整，取决于刷盘策略                                 |
| 文件大小       | 会有压缩，文件体积小                         | 记录命令，文件体积很大， bgwriteao可重写                 |
| 宕机恢复速度   | 很快                                         | 慢                                                       |
| 数据恢复优先级 | 低，因为数据完整性不如AOF                    | 高，因为数据完整性更高                                   |
| 系统资源占用   | 高，大量CPU和内存消耗                        | 低，主要是磁盘IO资源，但AOF重写时会占用大量CPU和内存资源 |
| 使用场景       | 可以容忍数分钟的数据丢失，追求更快的启动速度 | 对数据安全性要求较高                                     |



### 混合持久化

​		混合持久化并不是一种全新的持久化方式，而是对已有方式的优化。混合持久化只发生于 AOF 重写过程。使用了混合持久化，重写后的新 AOF 文件前半段是 RDB 格式的全量数据，后半段是 AOF 格式的增量数据。

​		整体格式为：<font color=Orchid>RDB file + AOF tail</font>

​		混合持久化本质是通过 AOF 后台重写（bgrewriteaof 命令）完成的，不同的是当开启混合持久化时，fork 出的子进程先将当前全量数据以 RDB 方式写入新的 AOF 文件，然后再将 AOF 重写缓冲区（aof_rewrite_buf_blocks）的增量命令以 AOF 方式写入到文件，写入完成后通知主进程将新的含有 RDB 格式和 AOF 格式的 AOF 文件替换旧的的 AOF 文件。

<font color=Orchid>aof-use-rdb-preamble</font>

```text
# 开启：在 redis 4 刚引入时，默认是关闭混合持久化的，但是在 redis 5 中默认已经打开了。
aof-use-rdb-preamble yes
# 关闭
aof-use-rdb-preamble no
```

优点：结合 RDB 和 AOF 的优点, 更快的重写和恢复。

缺点：AOF 文件里面的 RDB 部分不再是 AOF 格式，可读性差。



## 缓存更新策略

|          | 内存淘汰                                            | 超时剔除                                                     | 主动更新                                   |
| -------- | --------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| 描述     | 利用Redis内存淘汰机制，当内存不足时自动淘汰部分数据 | 给缓存数据添加TTL时间，到期后自动删除缓存，下次查询时更新缓存。 | 编写业务逻辑，在修改数据库的同时，更新缓存 |
| 一致性   | 差                                                  | 一般                                                         | 好                                         |
| 维护成本 | 无                                                  | 低                                                           | 高                                         |

<mark>主动更新策略</mark>

:question:删除缓存还是更新缓存？

- 更新缓存：每次更新数据库时都更新缓存，可能产生多次更新缓存，但期间没人来查询缓存，产生无效写较多。:x:
- 删除缓存：更新数据库时，让缓存失效，查询时再更新缓存。:heavy_check_mark:

:question:先操作缓存还是先操作数据库？

- <font color=red>先删除缓存，后操作数据库</font>：缓存删除后，更新数据库可能会比较耗时，并发环境下，其他线程此时进来可能无法感知到缓存的存在，直接查询数据库并返回。<font color=orchid>由于更新数据耗时长，发生概率较高。</font>不推荐:x:

  ![image-20230125110532941](http://images.xyzzs.top/image/image-20230125110532941.png_char)

- <font color=red>先操作数据库，再删除缓存</font>：在查询数据库后更新缓存前，第二个线程更新了数据库数据，导致数据库数据和缓存数据不一致。<font color=orchid>由于更新缓存速度很快，发生概率很小。</font>推荐:heavy_check_mark:

  ![image-20230125111321967](http://images.xyzzs.top/image/image-20230125111321967.png_char)

根据业务场景选择最佳实践方案：

1. 低一致性需求：使用Redis自带的内存淘汰机制。
2. 高一致性需求：主动更新，并以超时剔除作为兜底方案。
   - 读操作
     - 缓存命中则直接返回
     - 缓存未命中则查询数据库，并写入缓存，设定超时时间
   - 写操作
     - 先写数据库，然后再删除缓存
     - 必要时，确保数据库与缓冲操作的原子性

 

## 内存策略

### 过期策略

:thinking: 思考：Redis如何知道一个key是否过期呢？如果TTL到期后是否立即删除呢？

Redis本身是一个典型的key-value内存存储数据库，因此所有的key、value都保存在Dict结构中。不过在其database结构体中，有两个Dict：一个用来记录key-value；另一个用来记录key-TTL。

```c
typedef struct redisDb {
    dict *dict;		//存放所有key及value的地方
    dict *expires;	//存放每一个key及TTL，只包含设置了TTL的key
    dict *blocking_keys;
    dict *read_keys;
    dict *watched_keys;
    int id;
    long long avg_ttl;
    unsigned long expires_cursor;
} redisDb;
```

![image-20230127150342143](http://images.xyzzs.top/image/image-20230127150342143.png_char)

<marK>惰性删除</mark>：每次查找key时判断是否过期，如果过期则删除

顾名思义并不是TTL到期后马上删除，而是在访问一个key时，检查该key的存货时间，如果已经过期才执行删除。

<mark>周期删除</mark>：定期抽样部分key，判断是否过期，如果过期则删除

即通过一个定时任务，周期性的抽样部分过期的key，然后执行删除。执行周期分为两种：

- Redis会设置一个定时任务serverCorn()，按照server.hz频率来执行过期key，模式为SLOW
- Redis的每个事件循环前会调用beforeSleep()函数，执行过期key清理，模式为FAST

**SLOW模式规则**——<font color=orchid>低频耗时</font>

① 执行频率受server.hz影响，默认10，即每秒执行10次，每个执行周期<font color=orchid>100ms</font>。

② 执行清理耗时不超过一次执行周期的25%

③ 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期

④ 如果没打到时间上限（25ms）并且过期key比例不大于10%，再进行一次抽样，否则结束。

**FAST模式**——<font color=orchid>高频不耗时</font>

① 执行频率受beforeSleep()调用频率影响，但两次FAST模式间隔<font color=orchid>不低于25ms</font>

② 执行清理耗时不超过1ms

③ 逐个遍历db，逐个遍历db中的bucket，抽取20个key判断是否过期

④ 如果没达到时间上限（1ms），并且过期key比例大于10%，再进行一次抽样，否则结束。



### 淘汰策略

内存淘汰：就是当Redis内存使用达到设置的阈值时，Redis主动挑选部分key删除以释放更多内存。

Redis会在处理客户端命令的方法processCommand()中尝试做内存淘汰（即执行处理命令时）

<mark>8种淘汰策略</mark>，默认的策略为noeviction  

```c
noeviction：不会淘汰任何数据，当使用的内存空间超过 maxmemory 值时，再有写请求来时返回错误。
volatile-ttl：针对设置了过期时间的key，比较key的剩余TTL值，越小越先被淘汰
volatile-random：对设置了TTL的key，随机进行淘汰。也就是从db>expires中随机挑选
allkeys-random：对全体key，随机进行淘汰。也就是从db>dict中随机挑选
volatile-lru，对设置了TTL的key，使用lru算法进行淘汰。
allkeys-lru，对全体key，使用lru算法进行淘汰。
volatile-lfu，对设置了TTL的key，使用lfu算法进行淘汰。
allkeys-lfu，对全体key，使用lfu算法进行淘汰。

/* 前缀为volatile-和allkeys-的区别在于二者选择要清除的键时的字典不同:
volatile - 前缀的策略代表从redisDb中的 expire 字典中选择键进行清除；
allkeys  - 前缀的策略代表从redisDb中的 dict 字典中选择键进行清除。 */
```

LRU(Least Recently Used)：最少<font color=orchid>最近</font>使用。用当前时间减去最后一次访问时间，这个值越大，代表上次访问越久，则越优先淘汰。

LFU(Least Frequently Used)：最少<font color=orchid>频率</font>使用。统计每个key的访问频率，值越小，代表访问频率越低，则越优先淘汰。

```c
typedef struct redisObject {
    unsigned type;
    unsigned encoding;
    //LRU:以秒为单位记录最近一次访问时间，长度24bit
    //LFU:高16位以分钟为单位记录最近一次访问时间，低8位记录逻辑访问次数
    unsigned lru;
    int refcount;
    void *ptr;
}
```

LFU的访问次数之所以叫做**逻辑访问次数**，是因为并不是每次key被访问都计算，而是通过运算：

1. 生成 0 ~ 1 之间的随机数R
2. 计算 `1/(旧次数 + lfr_log_factor + 1)`，记录为P，lfr_log_factor 默认为10
3. 如果 R < P，则计数器 + 1，且最大不超过 255
4. 访问次数会随时间衰减，距离上一次访问时间间隔 lfr_decay_time 分钟（默认1），<font color=orchid>计数器 -1</font>

<mark>淘汰流程</mark>

![img](http://images.xyzzs.top/image/1665412912054-7642e6c0-e05a-4d59-bd17-647fddc2fe43.png_char)



## 缓存穿透、缓存击穿、缓存雪崩

### 缓存穿透

产生原因：指客户端请求的数据在<font color=orchid>缓存中和数据库中都不存在</font>，这样缓存永不会生效，这些请求都会打到数据库。

解决方案 ：

1. 缓存空对象：建议设置有效期
   - 优点：实现简单，维护方便
   - 缺点：额外的内存消耗，可能缓存大量不必要数据
2. 布隆过滤器：判断不存在的，则一定不存在；判断存在的，大概率存在，但也有小概率不存在。
   - 优点：内存占用较少，没有多余key
   - 缺点：1.实现复杂；2.存在误判可能，还是可能会发生穿透
3. 做好数据的基础格式校验
4. 加强用户权限校验
5. 做好热点参数的限流



### 缓存击穿

也称热点key问题

产生原因：一个被**高并发访问**并且**缓存重建业务复杂**的key突然失效了，瞬间给数据库带来巨大冲击。

解决方案：

1. 互斥锁：保证每个key只有一个线程去查询数据库，而其他线程为等待状态。

   <img src="http://images.xyzzs.top/image/image-20230125133155500.png_char" alt="image-20230125133155500" style="zoom:50%;" />

2. 逻辑过期：设置缓存永远不过期，通过字段判断缓存是否有效，若失效且在重建过程中，可暂时返回旧数据。



|          | 优点                                             | 缺点                                           |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| 互斥锁   | 没有额外的内存消耗<br />保证一致性<br />实现简答 | 线程需要等待，性能受影响<br />可能有死锁风险   |
| 逻辑过期 | 线程无需等待，性能较好                           | 不保证一致性<br />有额外内存消耗<br />实现复杂 |





### 缓存雪崩

产生原因：在同一时段内<font color=orchid>大量的缓存key同时失效或者Redis服务宕机</font>，导致大量请求到达数据库

解决方案：

1. 不同的key的TTL设置随机值
2. 利用Redis集群提高服务的可用性
3. 给缓存业务添加降级限流策略
4. 给业务添加多级缓存



## 缓存-分布式

### 主从

<mark>搭建主从架构</mark>，非常简单（改配置文件 > 启动 >> 建立联系）

1. 复制配置文件redis.conf。`cp redis.conf redis7001.conf`

2. 改端口。

   ```sh
   # 改为空闲端口
   port 7001
   ```

3. 修改保护进程。

   ```sh
   #这里原来是NO的，把它改为YES，这样它就可以在后台进行运行了
   daemonize yes
   ```

4. 修改pidfile

   ```sh
   #这里原来是pidfile /var/run/redis_6379.pid，这里后面的名字改为什么无所谓的，只要能做区分即可。
   pidfile /var/run/redis_7001.pid
   ```

5. 添加日志文件

   ```sh
   # 这里原来是logfile ""，可以加上日志的文件名，名字可以随便起，为了方便以后查看，直接 port.log
   logfile 7001.log
   ```

6. 修改dbfilename

   ```sh
   dbfilename dump7001.log
   ```

7. 建立主从关系

   1. 永久建立，redis.conf配置项

      ```sh
      replicaof <masterip> <masterport>
      replicaof localhost 7001
      
      # 从机只读模式默认是开启的：
      replica-read-only yes
      ```

   2. 临时建立，命令行方式

      :warning:注意：这个方法只能是暂时的，如果重启之后，他们又不是主从关系了，如果想永久变为主从关系，那就是第一种方法。

      ```sh
      # 以7001主机，7002从机为例
      --启动7001、7002
      --连接7002
      redis-cli -h localhost -p 7002
      
      -- 执行slaveof命令（slaveof IP port）
      slaveof localhost 7001
      ```

8. 查看主从信息

   ```sh
   # 主机查看主从信息（先运行redis-cli）,role:master，表示是主机,role:slave，表示从机
   info replication
   ```

9. 测试

   1. 主机执行set，从机执行get
   2. 从机执行set，无法执行`(error) READONLY You can't write against a read only replica.`

---



<mark>全量同步</mark>

主从第一次同步是全量同步

![image-20230124140019432](http://images.xyzzs.top/image/image-20230124140019432.png_char)

master如何判断slave是不是第一次来同步数据？需要以下字段保证：

- <font color=Orchid>Replication Id</font>：简称replid，是数据集的标记，id一致则说明是同一数据集。每一个master都有唯一的replid，slave则会继承master节点的replid
- <font color=Orchid>offset</font>：偏移量，随着记录在repl_baklog中的数据增多而逐渐增大。slave完成同步时也会记录当前同步的offset。如果slave的offset小于master的offset，说明slave数据落后于master，需要更新。

因此slave做数据同步时，必须向master声明自己的replication id和offset，master才能判断到底需要同步哪些数据。

<mark>增量同步</mark>

![image-20230124140112235](http://images.xyzzs.top/image/image-20230124140112235.png_char)

<img src="http://images.xyzzs.top/image/image-20230124135718216.png_char" alt="image-20230124135718216" style="zoom:50%;" />

:warning:repl_baklog大小有上限，写满后覆盖最早的数据。如果slave断开时间过久，导致尚未备份的数据被覆盖，则无法基于log做增量同步，只能再次全量同步。



可以从以下几个方面来优化Redis主从集群（思路1：减少全量同步、思路2：优化全量同步性能）

- 在master中配置repl-diskless-sync yes启用无磁盘复制，避免全量同步时的磁盘IO—要求网络带宽高

- Redis单节点上的内存占用不要太大，减少RDB导致的过多磁盘IO

- 适当提高repl_baklog的大小，发现slave宕机时尽快实现故障恢复，尽可能避免全量同步

- 限制一个master上的slave节点数量，如果实在是太多slave，则可以采用主-从-从链式结构，减少mater压力

  ![image-20230124141221433](http://images.xyzzs.top/image/image-20230124141221433.png_char)

  <mark>全量/增量同步小结</mark>

  1. 简述全量同步和增量同步区别？
     - 全量同步：master将完整内存数据生成RDB，发送到slave。后续命令记录在repl_baklog，逐个发送给slave。
     - 增量同步：slave提交自己的offset到master，master获取repl_baklog中从offset之后的命令给slave
  2. 什么时候执行全量同步?
     - slave节点第一次连接master节点时
     - slave节点断开时间太久，repl_baklog中的offset已经被覆盖时
  3. 什么时候执行增量同步?
     - slave节点断开又恢复，并且repl_baklog中能找到offset时

### 哨兵

:thinking:slave节点宕机恢复后可以找master节点同步数据，那master节点岩机怎么办?

<mark>作用和原理</mark>

Redis提供了哨兵(Sentinel)机制来实现主从集群的自动故障恢复。哨兵的结构和作用如下:

<img src="http://images.xyzzs.top/image/image-20230124144519132.png_char" alt="image-20230124144519132" style="zoom:50%;" />

- 监控：Sentinel会不断检查master和slave是否按预期工作
- 自动故障恢复：如果master故障，Sentinel会将一个slave提升为master。当故障实例恢复后也以新的master为主
- 通知：Sentinel充当Redis客户端的服务发现来源，当集群发生故障转移时，会将最新信息推送给Redis的客户端

---

主要流程：状态监控 > 选举新master > 实现故障自动转移

<font color=orchid>服务状态监控</font>

Sentinel基于心跳机制监测服务状态，每隔1秒向集群的每个实例发送ping命令:

- 主观下线: 如果某sentinel节点发现某实例未在规定时间响应，则认为该实例主观下线。
- 客观下线:若超过指定数量(quorum)的sentinel都认为该实例主观下线，则该实例客观下线。quorum值最好超过Sentinel实例数量的一半。

<font color=orchid>选举新master</font>

一旦发现master故障，sentinel需要在salve中选择一个作为新的master，选择依据是这样的:

- 首先会判断slave节点与master节点新开时间长短，如果超过指定值 (down-after-miliseconds* 10) 则会排除该slave节点
- 然后判断slave节点的slave-priority值，越小优先级越高
- 如果是0则永不参与选举如果slave-prority一样，则判断slave节点的sffset值，越大说明数据越新，优先级越高
- 最后是判断slave节点的运行id大小，越小优先级越高

<font color=orchid>如何实现故障转移</font>

当选中了其中一个slave为新的master后(例如slave1)，故障的转移的步骤如下

- sentinel给备选的slave1节点发送slaveof no one命令，让该节点成为master
- sentinel给所有其它slave发送slaveof 192.168.150.1017002命令，让这些slave成为新master的从节点，开始从新的master上同步数据。
- 最后，sentinel将故障节点标记为slave，当故障节点恢复后会自动成为新的master的slave节点

<!-- <mark>搭建哨兵集群</mark> -->

<!-- <mark>RedisTemplate的哨兵模式</mark> -->

### 分片式集群

 主从和哨兵可以解决高可用、高并发读的问题。但是依然有两个问题没有解决，:sob:经典白雪？:sob:

- 海量数据存储问题
- 高并发写的问题

使用分片集群可以解决上述问题，分片集群特征

- 集群中有多个master，每个master保存不同数据
- 每个master都可以有多个slave节点
- master之间通过ping监测彼此健康状态
- 客户端请求可以访问集群任意节点，最终都会被转发到正确节点

分片集群结构如下

![image-20230124162755259](http://images.xyzzs.top/image/image-20230124162755259.png_char)



<mark>散列插槽</mark>

Redis会把每一个master节点映射到0~16384个插槽（hash slot）上。

数据key不是与节点绑定，而是与插槽绑定。redis会根据key的有效部分计算插槽值，分两种情况：

- key中包含"{}"，且“{}”中至少包含1个字符，“{}”中的部分是有效部分
- key中不包含“{}”，整个key都是有效部分

例如: key是num，那么就根据num计算，如果是{itcast}num，则根据itcast计算。计算方式是利用CRC16算法得到一个hash值，然后对16384取余，得到的结果就是slot值。

:question:如何将同一类数据固定的保存在同一个Redis实例？

- 这一类数据使用相同的有效部分，例如key都以{typeid}为前缀

<mark>集群收缩</mark> 

<font color=orchid>增加节点</font>（包含主从节点添加方式）

```sh
# 加入集群
redis-cli --cluster add-node <新IP>:<新端口> <集群其一IP>:<集群其一端口>
		  --cluster-salve #默认是主节点，加上此参数则默认从节点
		  --cluster-master-id <arg> #并指定主机id

# 新增后，从集群节点分配插槽给当前实例
redis-cli --cluster reshard <集群其一IP>:<集群其一端口>
```

<font color=orchid>删除节点</font>

1. <font color=red>删除主节点</font>

   :warning:删除主节点之前，为了**防止数据的丢失**以及**集群功能的正常**，先应**把主节点所分配的哈希槽转移到其他主节点**上。在移动哈希槽时，要注意哈希槽从0开始计数，所以**移动时要输入的数字比添加时少1**。

```sh
# 1.转移主节点分配的哈希槽
redis-cli --cluster reshard <集群其一IP>:<集群其一端口>

# 2.删除没有哈希槽的主节点
redis-cli --cluster del-node <删除IP>:<删除端口> 删除的节点ID
```

2. <font color=red>删除从节点</font>：若主节点没有分配插槽，也可直接删除该主节点

```sh
redis-cli --cluster del-node <删除IP>:<删除端口> 删除的节点ID
```

---

<mark>故障转移</mark>

- <font color=orchid>自动转移</font>：当集群中有一个master岩机，将会通过以下流程自动转移
  1. 首先是该实例与其它实例失去连接
  2. 然后是疑似宕机
  3. 最后是确定下线，自动提升一个slave为新的master

- <font color=orchid>手动转移</font>：一般适用于新机主动去替换旧主机

  利用<font color=orchid>`cluster failover`</font>命令可以手动让集群中的某个master宕机，切换到执行`cluster failover`命令的这个slave节点，实现无感知的数据迁移。其流程如下:

  <img src="http://images.xyzzs.top/image/image-20230124195548323.png_char" alt="image-20230124195548323" style="zoom: 50%;" />

  手动的Failover支持三种不同模式：

  - 缺省：默认的流程，如图1~6步
  - force：省略了对offset的一致性校验
  - takeover：直接执行第5步，忽略数据一致性、忽略master状态和其它master的意见

<!-- <mark>搭建分片集群</mark> -->

<!-- <mark>RedisTemplate访问分片集群</mark> -->

---

<mark>集群注意点</mark>

- <font color=red>集群完整性问题</font>

  <font color=orchid>cluster-require-full-coverage</font>： 默认值 yes , 即需要集群完整性，方可对外提供服务

  如果你的诉求是，集群不完整的话，也需要对外提供服务，比如如下图，你也希望其它的小集群仍能对外提供服务，就需要将该参数设置为no ；这样的话，挂掉的那个小集群是不行了，但是其他的小集群仍然可以对外提供服务

  <img src="http://images.xyzzs.top/image/20200419224851565.png_char" alt="在这里插入图片描述" style="zoom:75%;" />

  ```sh
  # 为了保证高可用性，建议将cluster-require-full-coverage设置no
  cluster-require-full-coverage no
  ```

- <font color=red>集群带宽问题</font>

  集群节点之间会不断的互相Ping来确定集群中其它节点的状态。每次Ping携带的信息至少包括:

  - 插槽信息
  - 集群状态信息

  集群中节点越多，集群状态信息数据量也越大，10个节点的相关信息可能达到1kb，此时每次集群互通需要的带宽会非常高。解决方法如下：

  1. 避免大集群，集群节点数不要太多，最好少于1000，如果业务庞大，可拆分业务，建立多个集群。
  2. 避免在单个物理机中运行太多Redis实例
  3. 配置合适的cluster-node-timeout值，节点失效检测时间，默认 15000 ms

- <font color=red>数据倾斜问题</font>

  使用相同的有效key，导致部分负担过重

- <font color=red>客户端性能问题</font>

  访问集群，需要做节点的选择、插槽的判断、读写的判断等等，势必会浪费一部分性能 

- <font color=red>命令的集群兼容性问题</font>

  多键操作是不被支持的

- <font color=red>lua和事务问题</font>

  多键的Redis事务是不被支持的。lua脚本不被支持。

:exclamation:可以看到集群实现还是相对复杂的，要考虑的细节也很多；且单体Redis（主从Redis）已经能达到万级别的QPS（能满足大部分中小厂需求），并且也具备很强的高可用性。如果主从能满足业务需求的情况下，不建议搭建Redis集群。



## redis网络模型

:question:Redis到底是单线程还是多线程？

- 如果仅仅考虑Redis核心业务部分（命令处理），那么是单线程
- 如果是整个Redis，那么是多线程

在Redis版本迭代过程中，在两个重要的时间节点上引入了多线程支持：

:large_blue_diamond:Redis v4：引入多线程异步处理一些耗时较长的任务，例如异步删除命令等

:large_blue_diamond:Redis v6：在核心网络模型中引入多线，进一步提高对于多喝CPU的利用率



:question:那么，Redis为什么要坚持使用单线程呢？

1. Redis是纯内存操作（暂不考虑持久化），执行速度非常快，它的性能瓶颈是网络延迟而不是执行速度，因此多线程并不会带来明显的性能提升。
2. 多线程会导致过多的上下文切换，带来不必要的开销
3. 引入多线程会面临线程安全问题，必然采取线程锁等安全手段，实现复杂度增高，而且性能也会有所下降。



Redis v6 版本中引入了多线程，目的是为了提高IO读写效率。因此在解析客户端命令、写响应结果时采用了多线程。核心的命令执行、IO多路复用模块依然是主线程执行。

![image-20230127172621033](http://images.xyzzs.top/image/image-20230127172621033.png_char)

1. 启动server Socket，将server Socket的FD进行注册，监听该FD，并对此FD绑定处理器—`连接应答处理器`，该处理器用于接收客户的请求，处理server socket的readable事件
2. Client Socket向service Socket发起请求，触发client Socket的readable事件，绑定处理器—`命令请求处理器`
   1. 首先给每一个客户端封装一个对应的的client；
   2. 然后将请求数据写入client.queryBuf，
   3. 再调用client.queryBuf中的数据，通过解析，转为Redis命令，放在一个数组中
   4. 把执行结果写出，尝试把结果写到client.buf缓存区，如果写不下，则写到client.reply，这是个链表，无上限
   5. 将待写出的客户端添加到一个队列，等待被写出
3. 遍历队列中的client，监听FD写事件，绑定写处理器—`命令回复处理器`，将命令结果返回客户端。 



## 最佳实践

### Redis键值设计

#### 优雅的key结构

Redis的key虽然可以自定义，但最好遵循以下规则约定：

-  遵循基本规则：[业务名称]:[数据名]:[id]，例：登陆业务，保存用户信息：`login:user:1024`
- 长度不超过44字节，embstr在小于44字节使用，采用连续空间，内存占用更晓
- 不包含特殊字符

优点：①可读性强；②避免key冲突；③方便管理；

#### 拒绝bigkey

bigkey通常以key的大小和key中成员的数量来综合判定，

- key本身的数据量过大：一个String类型的key，它的值为5MB。

- key中成员数过多：图个人ZSet类型的key，它的成员数量为10000 个。

- key中成员的数据量过大：一个Hash类型的key，它的成员数量虽然只有1000个，但这些成员的value总大小100MB

  推荐值：①单个key的value小于10kb；②对于集合类型的key，建议元素数量小于1000

<mark>Bigkey的危害</mark>

- 网络阻塞

  对bigkey执行读请求时，少量的QPS就可能导致带宽使用率被占满，导致Redis实例，乃至所在物理机变慢

- 数据倾斜

  bigkey所在的Redis实例内存使用率远超其他实例，无法达到均衡

- Redis阻塞

  对元素较多的hash、list、zset等做运算会耗时较久，使主线程被阻塞

- CPI压力

  对bigkey的数据序列化和反序列化会导致CPU使用率飙升，印象Redis实例和本机其他应用

<mark>如何发现Bigkey</mark>

- redis-cli-bigkeys

  利用redis-cli提供的 --bigkey参数，遍历分析所有key，并返回key的整体统计信息与每个数据的top1的bigkey

- scan扫描

  自己编程，利用scan扫描Redis中的所有key，利用strlen，hlen等命令判断key的长度

- 第三方工具

  利用第三方工具，如`Redis-Rdb-Tools`分析RDB快照文件，全面分析内存使用情况

- 网络监控

  自定义工具，监控进出Redis的网络数据，超出预警值时主动告警

<mark>如何删除Bigkey</mark>

Bigkey内存占用较多，删除这样的key也需要耗费较长时间，导致Redis主线程阻塞，引发一些列问题。

- Redis V3 及以前版本

  如何是集合类型，则遍历Bigkey的元素，先逐个删除子元素，最后删除Bigkey

- Redis V4以后

  4.0后提供异步删除命令：unlink

### 批处理

#### pipline

批处理方案：

1. 原生的M操作
2. pipline批处理

注意事项：

- 批处理时不建议一次携带太多命令
- pipline的多个命令之间不具备原子性

#### 集群模式下的批处理

如mset或pipline这样的批处理需要在一次请求中携带多条命令，而此时如果Redis是一个集群，那批处理命令的多个key必须落在一个插槽中，否则就会导致执行失败。

|          | 串行命令 | 串行slot | 并行slot | hash_tag |
| -------- | -------- | -------- | -------- | -------- |
| 实现思路 |          |          |          |          |
| 耗时     |          |          |          |          |
| 优点     |          |          |          |          |
| 缺点     |          |          |          |          |

<!--  

### 服务端配置优化

#### 内存配置

info memory

memory state

#### 命令及安全配置

秘钥登陆bug 

#### 慢查询配置

#### 持久化配置

-->
