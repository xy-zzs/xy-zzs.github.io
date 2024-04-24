# 数据结构及算法导航栏

<mark>数据结构三要素</mark>：包括数据逻辑结构、数据存储结构和数据的运算。

**逻辑结构**是指数据元素之间的逻辑关系，即从逻辑关系上描述数据。它与数据的存储无关，是独立于计算机的。

数据的逻辑结构分为线性结构和非线性结构

逻辑结构指的是数据与数据之间的逻辑关系，逻辑结构有以下四种：
  （1）数据和数据之间没关系的时候是集合，
  （2）数据和数据之间是一对一的关系就是线性结构（除了尾数据，其余数据后面只跟着一个元素叫做一对一的关系）
  （3）数据和数据之间是一对多的关系就是树形结构（一个元素后面可以跟着多个元素，像树干可以有很多枝干一样）
  （4）数据和数据之间是多对多的关系就是图结构
  逻辑结构不涉及在计算机中的如何实现，我们仅仅是在自己的脑子里用理性思维去给数据和数据之间的关系分
  类。这四种分类应该可以囊括各种各样的数据关系。

**存储结构**也叫做物理结构，涉及到了数据之间的关系在计算机上的实现，所以就考虑到了内存。
注意：每个逻辑结构都有四种存储结构，共同构成数据结构
1、顺序结构也就是数据所存储的内存地址是连续的
2、链式存储也就是上一个元素通过指针的方式指向下一个元素
3、索引存储也就是数据元素通过索引（指针）来指向，逻辑结构通过指针来体现
4、散列存储也称哈希存储，数据元素的存储地址是通过计算得到的（这个在第六章讨论）
可以发现，上面的存储结构中，只有顺序存储的内存必须是连续的，其余的存储结构的内存可以是分散的。
存储结构会影响存储空间分配的效率，比如顺序存储如果想在结构中插入一个元素，效率很低，而非顺序存储插入一个元素效率高
存储结构会影响数据运算的速度。比如顺序结构查找的速度高

**数据的运算**

1. 运算的定义是对于逻辑结构的，就是说我们定义了一个运算，这个运算的作用对象是逻辑结构（比如对于线性结构定义增删查改）
2. 运算的实现是对于存储结构的，就是说我们实现运算时针对于特定的存储结构的，同一个逻辑结构的不同的存储结构运算的实现是不同的。



## 线性结构 

### 顺序表（数组）

原理：在内存中开辟连续的内存空间存储相同类型的数据，物理上的连续的数据结构。它由相同类型的元素（element）组成，并且每个元素大小相同，方便查找元素。在已知第一个元素的存储地址后，可通过该元素的索引（index）快速计算出该元素的存储地址。

时间复杂度：读取和更新都是随机访问，复杂度 O(1)

​                     插入和删除涉及到数据移动，复杂度 O(n)

优点：随机访问效率高，相比链表，不需要维护节点指针信息，比链表节省空间

缺点：需要连续的空间，创建时就要分配内存空间，没有连续内存空间可能创建失败

应用：数组是基础的数据结构，应用太广泛了，ArrayList、消息队列等等

### 链表

原理：在物理上非连续、非顺序的数据结构，由若干节点（node）所组成，通过指针将各个节点关联起来，有效的利用零散的碎片空间。

时间复杂度：插入，更新，删除都是 O(1)，查找是 O(n)。

优点：1插入效率高；2.不需要预先知道数据大小；3可以充分利用计算机内存空间，实现灵活的内存动态管理，理论上内存无上限（取决物理机内存大小）

缺点：1查询效率低，不能随机访问；2相比于数组会占用更多的空间，每个节点还存放指向其他节点的指针

应用：链表的应用也非常广泛，比如树、图、 LRU 算法实现等

<mark>链表的分类</mark>

1. 单链表

   原理：结点只有一个后继指针 next 指向后面的节点。因此，链表这种数据结构通常在物理内存上是不连续的。

   实现方式分为带头节点和不带头节点的。我们习惯性地把第一个结点叫作头结点，链表通常有一个不保存任何值的 head 节点(头结点)，通过头结点我们可以遍历整个链表。尾结点通常指向 null

2. 双链表：包含两个指针，一个 prev 指向前一个节点，一个 next 指向后一个节点。

3. 循环链表：一种特殊的单链表，和单链表不同的是循环链表的尾结点不是指向 null，而是指向链表的头结点，头尾相连。

4. 静态链表：分配一整片连续的内存空间，各个结点集中安置，逻辑结构上相邻的数据元素，存储在指定的一块内存空间中，数据元素只允许在这块内存空间中随机存放，这样的存储结构生成的链表称为静态链表。也就是说静态链表是用数组来实现链式存储结构。

<img src="http://images.xyzzs.top/image/1668862907315-75afdfd9-ae5b-4b23-be02-f914b40127ea.png_char" alt="img" style="zoom:50%;" />

### 栈

原理：栈属于线性结构的逻辑存储结构，是一种操作受限的线性表，只允许在线性数据集合的**一端**（称为栈顶 top）进行加入数据（push）和移除数据（pop）。栈中的元素只能**先入后出**。

实现方式可以通过数组实现也可通过链表实现；用数组实现的栈叫作 **顺序栈** ，用链表实现的栈叫作 **链式栈** 。

时间复杂度：入栈（插入）、出栈（删除）复杂度都是O(1)；查找复杂度是 O(n)。

基本操作：push()`、`pop()`（返回栈顶元素并出栈）、`peek()` （返回栈顶元素不出栈）、`isEmpty()`、`size()

应用：函数调用记录，浏览器的前进后退功能，括号匹配，表达式求值，递归等

### 队列

原理：栈属于线性结构的逻辑存储结构，是一种操作受限的线性表，队列只允许在后端（rear）进行插入操作也就是 入队 enqueue，在前端（front）进行删除操作也就是出队 dequeue。队列中元素遵循**先进先出**原则。

实现方式可以用链表或者数组来实现，用数组实现的队列叫作**顺序队列**，用链表实现的队列叫作**链式队列**。

 时间复杂度：入队、出队复杂度都是O(1)。

 应用：资源池（如线程池）、树的层次遍历、图的广度优先遍历、生产-消费模型

<mark>队列分类</mark>

1. 单队列：最基本的队列
2. 双端队列：允许从两端插入、两端删除的线性表
3. 循环队列：头尾相连的队列，可以解决顺序队列的假溢出和越界问题
4. 阻塞队列：当队列为空的时候，出队操作阻塞，当队列满的时候，入队操作阻塞。很容易实现“生产者 - 消费者“模型。
5. 无界队列、有界队列：即在理论上有没有上限的两种队列

### 串

串( string)是由零个或多个字符组成的有限序列，又名叫字符串。

串的逻辑结构和线性表极为相似，区别仅在于串的数据对象限定为字符集。在基本操作上,串和线性表有很大差别。线性表的基本操作主要以单个元素作为操作对象，如查找、插入或删除某个元素等;而串的基本操作通常以子串作为操作对象，如查找、插入或删除一个子串等。

- 空串：n = 0 时的串称为空串。
- 空格串：是只包含空格的串。注意它与空串的区别，空格串是有内容有长度的，而且可以不止一个空格。
- 子串与主串：串中任意个数的连续字符组成的子序列称为该串的子串，相应地，包含子串的串称为主串。
- 子串在主串中的位置就是子串的第一个字符在主串中的序号。

<mark>模式匹配</mark>：求子串在主串中的位置

1. 简单的模式匹配算法—暴力匹配
2. :star:kmp算法：秀的我头皮发麻，下次一定。TODO

## 树

树就是一种类似现实生活中的树的数据结构（倒置的树）。任何一颗非空树只有一个根节点。

树是n ( n≥0)个结点的有限集合，n =0时，称为空树，这是一种特殊情况。在任意一棵非空树中应满足：

1. 有且仅有一个特定的称为根的结点。
2. 当n>1时，其余结点可分为m (m>0)互不相交的有限集合，其中每个集合本身又是一棵树，并且称为根结点的子树。

![image-20230129110519455](http://images.xyzzs.top/image/image-20230129110519455.png_char)



![image-20230129111043914](http://images.xyzzs.top/image/image-20230129111043914.png_char)

**节点** ：树中的每个元素都可以统称为节点。

**根节点** ：顶层节点或者说没有父节点的节点。上图中 A 节点就是根节点。

**父节点** ：若一个节点含有子节点，则这个节点称为其子节点的父节点。上图中的 B 节点是 D 节点、E 节点的父节点。

**子节点** ：一个节点含有的子树的根节点称为该节点的子节点。上图中 D 节点、E 节点是 B 节点的子节点。

**兄弟节点** ：具有相同父节点的节点互称为兄弟节点。上图中 D 节点、E 节点的共同父节点是 B 节点，故 D 和 E 为兄弟节点。

**叶子节点** ：没有子节点的节点。上图中的 D、F、H、I 都是叶子节点。

**节点的高度** ：该节点到叶子节点的最长路径所包含的边数。

**节点的深度** ：根节点到该节点的路径所包含的边数

**节点的层数** ：节点的深度+1。

**树的高度** ：根节点的高度。

---

### 二叉树

<mark>满二叉树</mark>

如果一个二叉树每一个层的结点数都达到最大值，则这个二叉树就是 **满二叉树**。也就是说，如果一个二叉树的层数为 K，且结点总数是(2^k) -1 。如下图所示

![image-20230129111901494](http://images.xyzzs.top/image/image-20230129111901494.png_char)

<font color=red>特点</font>

1. 只有最后一层有叶子节点
2. 按层序从1开始编号，结点` i` 的左孩子为 `2i`，右孩子为 `2i+1`；结点`i `的父节点为 `i/2`(如果有的话)

<mark>完全二叉树</mark>

除最后一层外，若其余层都是满的，并且最后一层是<font color=orchid>在右边缺少连续若干节点</font>，则这个二叉树就是 **完全二叉树** 。

![image-20230129112601085](http://images.xyzzs.top/image/image-20230129112601085.png_char)

<font color=red>特点</font>

1. 只有最后两层可能有叶子结点
2. 按层序从1开始编号，结点` i` 的左孩子为 `2i`，右孩子为 `2i+1`；结点`i `的父节点为 `i/2`(如果有的话)
3. i ≤[n/2]为分支节点，i >[n/2]为叶子节点

<mark>二叉排序树</mark>

- 若它的左子树不空，则左子树上所有结点的值均小于它根结点的值。

- 若它的右子树不空，则右子树上所有结点的值均大于它根结点的值。

- 它的左、右树又分为⼆叉排序树

  ![image-20230129113702270](http://images.xyzzs.top/image/image-20230129113702270.png_char)

:star:<mark>平衡二叉树</mark> 

平衡二叉树是一棵二叉排序树，且具有以下性质：

1. 可以是一棵空树
2. 如果不是空树，它的左右两个子树的高度差的绝对值不超过 1，并且左右两个子树都是一棵平衡二叉树。

<img src="http://images.xyzzs.top/image/image-20230129114147313.png_char" alt="image-20230129114147313" style="zoom:67%;" />

**调整不平衡**—找打最小不平衡子树进行调整，记最小不平衡子树的根为A

- LL：在A的左孩子的左子树插入导致A不平衡，将A的左孩子右上旋
- RR：在A的右孩子的右子树插入导致A不平衡，将A的右孩子左上旋
- LR：在A的左孩子的右子树插入导致A不平衡，将A的左孩子的右孩子 先左上旋再右上旋
- RL：在A的右孩子的左子树插入导致A不平衡，将A的右孩子的左孩子 先右上旋再左上旋

平衡二叉树最大深度为 o(log n)，平均查找长度/查找的时间复杂度为 (log n)

### 树的存储

<mark>顺序存储</mark>

和链表类似，二叉树的链式存储依靠指针将各个节点串联起来，不需要连续的存储空间。

每个节点包括三个属性：

- 数据 data。data 不一定是单一的数据，根据不同情况，可以是多个具有不同类型的数据。
- 左节点指针 left
- 右节点指针 right。

![image-20230129114822094](http://images.xyzzs.top/image/image-20230129114822094.png_char)

<mark>链式存储</mark>

顺序存储就是利用数组进行存储，数组中的每一个位置仅存储节点的 data，不存储左右子节点的指针，子节点的索引通过数组下标完成。

![image-20230129114800373](http://images.xyzzs.top/image/image-20230129114800373.png_char)

---

### 树的遍历

<mark>先中后序遍历</mark>

<font color=orchid>先</font>序遍历：<font color=orchid>根</font>左右

<font color=orchid>中</font>序遍历：左<font color=orchid>根</font>右

<font color=orchid>后</font>序遍历：左右<font color=orchid>根</font>

左节点永远先于右节点被遍历到，区关键在于根何时被遍历，`先中后`可以理解为根被遍历到的时机，方便记忆。

```java
//先序遍历
public void preOrder(TreeNode root){
	if(root == null){
		return;
	}
	system.out.println(root.data);
	preOrder(root.left);
	preOrder(root.right);
}
//中序遍历
public void inOrder(TreeNode root){
	if(root == null){
		return;
	}
	inOrder(root.left);
	system.out.println(root.data);
	inOrder(root.right);
}
//后序遍历
public void postOrder(TreeNode root){
	if(root == null){
		return;
	}
	postOrder(root.left);
	postOrder(root.right);
	system.out.println(root.data);
}
```

<mark>层次遍历</mark>

![image-20230129122011565](http://images.xyzzs.top/image/image-20230129122011565.png_char)

<font color=red>算法思路</font>

1. 先初始化一个辅助队列
2. 根节点入队
3. 若队列非空，则对头节点出队；访问该节点，并将其左右孩子节点插入队尾（若有的话）
4. 重复 `步骤3` 直至队列为空

---

### 恢复二叉树

通过给定的遍历序列 从已知的遍历序列还原为原来的二叉树称为恢复二叉树，因树采用递归的方式创建 故也可采用递归的方式恢复二叉树。

由二叉树的遍历序列构造二叉树：

1. 前序+中序遍历序列
2. 后序+中序遍历序列
3. 层序+中序遍历序列

由此可以看出来都是`中序+()序`的组合。那是因为只有中序遍历序列的根节点在中间，其他遍历方式，可以根据自身遍历方式在头或尾结点得到根节点；然后两者结合，递归遍历，即可还原二叉树。

**找到树的根节点，并根据中序遍历划分左右子树，再找到左右子树根节点。**

前序遍历序列：<font color=fuchsia>根节点</font>	<font color=DarkTurquoise >左子树的前序遍历序列</font>	<font color=DarkTurquoise >右子树的前序遍历序列</font>

中序遍历序列：<font color=DarkTurquoise >左子树的中序遍历序列</font>	<font color=fuchsia>根节点</font>	<font color=DarkTurquoise >右子树的中序遍历序列</font>

后序遍历序列：<font color=DarkTurquoise >左子树的后序遍历序列</font>	<font color=DarkTurquoise >右子树的后序遍历序列</font>	<font color=fuchsia>根节点</font>

层序遍历序列：<font color=fuchsia>根节点</font>		<font color=DarkTurquoise >左子树的根</font>		<font color=DarkTurquoise >右子树的根</font>

---

### 线索二叉树

遍历树会得到以一定规则将二叉树中的结点排列成一个线性序列，得到二叉树中结点的先序序列、中序序列或后序序列。这些线性序列中的每一个元素都有且仅有一个**前驱结点**和**后继结点**。但是，这种关系的建立是在完成遍历后得到的。那么，可不可以在建立二叉树的同时记录下前驱后继的关系，这样我们在寻找前驱后继结点时的效率将会大大提升！

于是是否能够改变原有的结构，将结点的前驱和后继的信息存储进来。



:thinking:思考：二叉树结构，发现叶子结点指针域并没有充分的利用，有很多`NULL`，也就是存在很多空指针。

可以用空链域来存放结点的前驱和后继。线索二叉树就是利用n+1个空链域来存放结点的前驱和后继结点的信息。



现将某结点的空指针域指向该结点的前驱后继，定义规则如下：

> - 若结点的左子树为空，则该结点的左孩子指针指向其前驱结点
> - 若结点的右子树为空，则该结点的右孩子指针指向其后继结点
>
> 这种指向前驱和后继的**指针**称为**线索**，将一棵普通的二叉树以某种次序遍历，并添加线索的过程称为线索化。

<font color=red>线索化带来的问题</font>

1. :question:我们如何区分一个lchild指针是指向左孩子还是前驱结点呢？

   为了解决这个问题，我们需要添加标志位ltag和rtag,并定义以下规则

   > - ltag==0，指向左孩子；ltag==1，指向前驱结点
   > - rtag==0，指向右孩子；rtag==1，指向后继结点

2. :question:非叶子节点如何保存前驱后续节点？

   TODO 我忘了。。。。。

---

### 哈夫曼树

在认识哈夫曼树之前，你必须知道以下几个基本术语：
**1、什么是路径？**

> 在一棵树中，从一个结点往下可以达到的结点之间的通路，称为路径。

如图，从根结点 A 到叶子结点 I 的路径就是 A -> C -> F -> I 

<img src="http://images.xyzzs.top/image/20210616132630121.png_char" alt="img" style="zoom:33%;" />

**2、什么是路径长度？**

> 某一路径所经过的“边”的数量，称为该路径的路径长度

如图，该路径经过了3条边，因此该路径的路径长度为3

<img src="http://images.xyzzs.top/image/20210616132707604.png_char_char" style="zoom:33%;" />



**3、什么是结点的带权路径长度？**

> 若将树中结点赋给一个带有某种含义的数值，则该数值称为该结点的权。从根结点到该结点之间的路径长度与该结点的权的乘积，称为该结点的带权路径长度。

如图，叶子结点I的带权路径长度为 3 × 3 = 9 

<img src="http://images.xyzzs.top/image/20210616132751559.png_char" alt="img" style="zoom:33%;" />

**4、什么是树的带权路径长度？**

> 树的带权路径长度规定为所有叶子结点的带权路径长度之和，记为WPL。

<img src="http://images.xyzzs.top/image/20210616132823881.png_char" alt="img" style="zoom:33%;" />

如图，该二叉树的带权路径长度 WPL= 2 × 2 + 2 × 6 + 3 × 1 + 3 × 3 + 2 × 2 = 32 

**5、什么是哈夫曼树？**

> 给定n个权值作为n个叶子结点，构造一棵二叉树，若该树的带权路径长度达到最小，则称该二叉树为哈夫曼树，也被称为最优二叉树

根据树的带权路径长度的计算规则，我们不难理解：**树的带权路径长度与其叶子结点的分布有关。**
即便是两棵结构相同的二叉树，也会因为其叶子结点的分布不同，而导致两棵二叉树的带权路径长度不同。

<img src="http://images.xyzzs.top/image/20210616142631946.png_char" alt="img" style="zoom:33%;" />

:question:那如何才能使一棵二叉树的带权路径长度达到最小呢？
**根据树的带权路径长度的计算规则，我们应该尽可能地让权值大的叶子结点靠近根结点，让权值小的叶子结点远离根结点，这样便能使得这棵二叉树的带权路径长度达到最小。**

<mark>哈夫曼树的构建</mark>

<font color=red>构建思路</font>：下面给出一个非常简洁易操作的算法，来构造一棵哈夫曼树：

1. 初始状态下共有n个结点，结点的权值分别是给定的n个数，将他们视作n棵只有根结点的树。
2. 合并<font color=orchid>其中根结点权值最小的两棵树</font>，生成这两棵树的父结点，权值为这两个根结点的权值之和，这样树的数量就减少了一个。
3. 重复操作2，直到只剩下一棵树为止，这棵树就是哈夫曼树。

![在这里插入图片描述](http://images.xyzzs.top/image/2021061710513351.gif_char)

<!-- https://blog.csdn.net/chenlong_cxy/article/details/117929139?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522167496860616800184135911%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=167496860616800184135911&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-117929139-null-null.142^v71^control_1,201^v4^add_ask&utm_term=%E5%93%88%E5%A4%AB%E6%9B%BC%E6%A0%91&spm=1018.2226.3001.4187 -->

---

### B树-多路平衡查找树

B树即平衡查找树，一般理解为平衡多路查找树，也称为B-树、B_树，是一种自平衡树状数据结构，能对存储的数据进行O(log n)的时间复杂度进行查找、插入和删除。B树一般较多用在存储系统上，比如数据库或文件系统。

![image-20230129141326934](http://images.xyzzs.top/image/image-20230129141326934.png_char)

<mark>m路(阶)B树的核心特点</mark>

- 根节点的子树数∈[ 2 , m ]，关键字数∈[ 1 , m-1 ]

  其他节点的子树数∈[ m/2 , m ]，<font color=orchid>关键字数∈[ (m/2)-1 , m-1 ]</font>

- k颗子树的非叶节点有<font color=blue>k-1个键</font>，键按照递增顺序排列。

- 节点内的值按照从小到大排列

- 对任一节点，其所有子树高度都相同

- 所有叶子节点在同一层

<mark>B树出现的目的</mark>

B树的出现是为了弥补不同的存储级别之间的访问速度上的巨大差异<font color=orchid>实现高效的 I/O</font>。平衡二叉树的查找效率是非常高的，并可以通过降低树的深度来提高查找的效率。但是<font color=orchid>当数据量非常大，二叉树的存储的元素数量是有限的，这样会导致二叉查找树结构由于树的深度过长而造成磁盘I/O读写过于频繁，进而导致查询效率低下。</font>另外数据量过大会导致内存空间不够容纳平衡二叉树所有结点的情况。B树是解决这个问题的很好的结构。

> B树的每一个结点都包含key(索引值) 和 value(对应数据)，因此方位离根结点近的元素会更快速。（相对于B+树）

<!-- 插入、删除 -->

### B+树

![image-20230129141425720](http://images.xyzzs.top/image/image-20230129141425720.png_char)

- 其他定义同B树
- 有k颗子树的非叶节点有<font color=blue>k</font> 个键，键按照递增顺序排列。

<mark>B+树与B树比较</mark>

- B+树内部分为两种结点，一种是索引结点，一种是叶子结点。
- B+树的索引结点并不会保存记录，只用于索引，所有的数据都保存在B+树的叶子结点中。而B树则是所有结点都会保存数据。
- B+树的叶子结点都会被连成一条链表。叶子本身按索引值的大小从小到大进行排序，即这条链表是<font color=orchid>从小到大的</font>，多了条链表方便范围查找数据。
- B树的所有索引值是不会重复的，而B+树 非叶子结点的索引值**最终一定会全部出现在叶子结点中**。

<mark>B+ 树比B树更适合索引</mark>

1）B+树的磁盘读写代价更低

B+树的内部结点并没有指向关键字具体信息的指针。因此其内部结点相对B 树更小。如果把所有同一内部结点的关键字存放在同一盘块中，那么盘块所能容纳的关键字数量也越多。一次性读入内存中的需要查找的关键字也就越多。相对来说IO读写次数也就降低了；<font color=orchid>相比B树更矮胖，减少磁盘IO次数</font>

2）B+树查询效率更加稳定

由于非终结点并不是最终指向文件内容的结点，而只是叶子结点中关键字的索引。所以任何关键字的查找必须走一条从根结点到叶子结点的路。所有关键字查询的路径长度相同，导致每一个数据的查询效率相当；

3）<font color=orchid>B+树便于范围查询</font>（最重要的原因，范围查找是数据库的常态）

B树在提高了IO性能的同时并没有解决元素遍历的效率低下的问题，正是为了解决这个问题，B+树应用而生。B+树只需要去遍历叶子节点就可以实现整棵树的遍历。而且在数据库中基于范围的查询是非常频繁的，而B树不支持这样的操作或者说效率太低。

> B树的范围查找用的是中序遍历，而B+树用的是在链表上遍历。

### 红黑树

1. 每个节点非红即黑；
2. 根节点总是黑色的；
3. 每个叶子节点都是黑色的空节点（NIL节点）；
4. 如果节点是红色的，则它的子节点必须是黑色的（反之不一定）；
5. 从根节点到叶节点或空子节点的每条路径，必须包含相同数目的黑色节点（即相同的黑色高度）

 [漫画：什么是红黑树？](https://juejin.im/post/5a27c6946fb9a04509096248#comment)

## 图

### 定义和分类

图(Graph)是由顶点的有穷非空集合V ( G )和顶点之间边的集合E ( G ) 组成，通常表示为: G = ( V , E ) ，其中，G 表示个图，V 是图G 中顶点的集合，E 是图G 中边的集合。若V = { v1 , v2 , . . . , vn } ，则用∣ V ∣表示图G 中顶点的个数，也称图G 的阶，E = { ( u , v ) ∣ u ∈ V , v ∈ V } ，用∣ E ∣ 表示图G GG中边的条数。

度表示一个顶点包含多少条边，在有向图中，还分为出度和入度，出度表示从该顶点出去的边的条数，入度表示进入该顶点的边的条数。

> 注意:线性表可以是空表，树可以是空树，但图不可以是空图。就是说，图中不能一个顶点也没有，图的顶点集V一定非空，但边集E可以为空，此时图中只有顶点而没有边。

<mark>无向图和有向图</mark>

边表示的是顶点之间的关系，有的关系是双向的，比如同学关系，A是B的同学，那么B也肯定是A的同学，那么在表示A和B的关系时，就不用关注方向，用不带箭头的边表示，这样的图就是无向图。

有的关系是有方向的，比如父子关系，师生关系，微博的关注关系，A是B的爸爸，但B肯定不是A的爸爸，A关注B，B不一定关注A。在这种情况下，我们就用带箭头的边表示二者的关系，这样的图就是有向图。

<mark>无权图和带权图</mark>

对于一个关系，如果我们只关心关系的有无，而不关心关系有多强，那么就可以用无权图表示二者的关系。

对于一个关系，如果我们既关心关系的有无，也关心关系的强度，比如描述地图上两个城市的关系，需要用到距离，那么就用带权图来表示，带权图中的每一条边一个数值表示权值，代表关系的强度。

### 图的存储

<mark>邻接矩阵存储</mark>

邻接矩阵将图用二维矩阵存储，是一种较为直观的表示方式。

如果第i个顶点和第j个顶点之间有关系，且关系权值为n，则 `A[i][j]=n` 。

在无向图中，我们只关心关系的有无，所以当顶点i和顶点j有关系时，`A[i][j]`=1，当顶点i和顶点j没有关系时，`A[i][j]`=0

> 无向图的邻接矩阵是一个对称矩阵，因为在无向图中，顶点i和顶点j有关系，则顶点j和顶点i必有关系。

![image-20230129145054200](http://images.xyzzs.top/image/image-20230129145054200.png_char)



邻接矩阵存储的方式优点是<font color=orchid>简单直接</font>（直接使用一个二维数组即可），并且，在获取两个定点之间的关系的时候也非常<font color=orchid>高效</font>（直接获取指定位置的数组元素的值即可）。但是，这种存储方式的缺点也比较明显，那就是比较<font color=orchid>浪费空间</font>。

<mark>邻接表存储</mark>

针对上面邻接矩阵比较浪费内存空间的问题，诞生了图的另外一种存储方法—**邻接表** 。

邻接链表使用一个链表来存储某个顶点的所有后继相邻顶点。对于图中每个顶点Vi，把所有邻接于Vi的顶点Vj链成一个单链表，这个单链表称为顶点Vi的 **邻接表**。如下图所示

<img src="http://images.xyzzs.top/image/image-20230129145506310.png_char" alt="image-20230129145506310" style="zoom: 67%;" /> <img src="http://images.xyzzs.top/image/image-20230129145659971.png_char" alt="image-20230129145659971" style="zoom:67%;" />

TODO

### 图的遍历

深度优先遍历

广度优先遍历

### 最小生成树

prim算法（普里姆）

Kruskal算法（克鲁斯卡尔）

### 最短路径问题

1. 单源最短路径—G港口是个物流中心，经常运送东西

   1. BFS算法
   2. Dijkstra算法（迪杰斯特拉）

2. 各顶点间的最短路径—各城市之间互相往来

   Floyd算法（弗洛伊德）



![img](http://images.xyzzs.top/image/1668929016645-fb20387d-9d8f-4f92-afb1-1c782ba2130f.png_char)





## 算法

### 十大经典排序算法

十种常见排序算法可以分类两大类别：**比较类排序**和**非比较类排序**。

常见的**快速排序**、**归并排序**、**堆排序**以及**冒泡排序**等都属于**比较类排序算法**。比较类排序是通过比较来决定元素间的相对次序，由于其时间复杂度不能突破 `O(nlogn)`，因此也称为非线性时间比较类排序。在冒泡排序之类的排序中，问题规模为 `n`，又因为需要比较 `n` 次，所以平均时间复杂度为 `O(n²)`。在**归并排序**、**快速排序**之类的排序中，问题规模通过**分治法**消减为 `logn` 次，所以时间复杂度平均 `O(nlogn)`。

比较类排序的优势是，适用于各种规模的数据，也不在乎数据的分布，都能进行排序。可以说，比较排序适用于一切需要排序的情况。

而**计数排序**、**基数排序**、**桶排序**则属于**非比较类排序算法**。非比较排序不通过比较来决定元素间的相对次序，而是通过确定每个元素之前，应该有多少个元素来排序。由于它可以突破基于比较排序的时间下界，以线性时间运行，因此称为线性时间非比较类排序。 非比较排序只要确定每个元素之前的已有的元素个数即可，所有一次遍历即可解决。算法时间复杂度 `O(n)`。

非比较排序时间复杂度底，但由于非比较排序需要占用空间来确定唯一位置。所以对数据规模和数据分布有一定的要求。

---

<mark>冒泡排序</mark>

冒泡排序是一种简单的排序算法。它重复地遍历要排序的序列，依次比较两个元素，如果它们的顺序错误就把它们交换过来。遍历序列的工作是重复地进行直到没有再需要交换为止，此时说明该序列已经排序完成。这个算法的名字由来是因为越小的元素会经由交换慢慢 “浮” 到数列的顶端。

<font color=red>算法步骤</font>

1. 比较相邻的元素。如果第一个比第二个大，就交换它们两个；
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对，这样在最后的元素应该会是最大的数；
3. 针对所有的元素重复以上的步骤，除了最后一个；
4. 重复步骤 1~3，直到排序完成。

<font color=red>图解</font>

![在这里插入图片描述](http://images.xyzzs.top/image/20210509190446264.gif_char)

<font color=red>算法分析</font>

- **稳定性**：稳定
- **时间复杂度** ：最佳：O(n) ，最差：O(n2)， 平均：O(n2)
- **空间复杂度** ：O(1)
- **排序方式** ：In-place

```java
/**
 * 冒泡排序
 * @param arr
 * @return arr
 */
public static int[] bubbleSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        // Set a flag, if true, that means the loop has not been swapped,
        // that is, the sequence has been ordered, the sorting has been completed.
        boolean flag = true;
        for (int j = 0; j < arr.length - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
			    // Change flag
                flag = false;
            }
        }
        if (flag) {
            break;
        }
    }
    return arr;
}
```



<mark>选择排序</mark>

选择排序是一种简单直观的排序算法，无论什么数据进去都是 `O(n²)` 的时间复杂度。所以用到它的时候，数据规模越小越好。唯一的好处可能就是不占用额外的内存空间了吧。它的工作原理：首先<font color=orchid>在未排序序列中找到最小（大）元素</font>，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。

<font color=red>算法步骤</font>

1. 首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置
2. 再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。
3. 重复第 2 步，直到所有元素均排序完毕

<font color=red>图解</font>

![在这里插入图片描述](http://images.xyzzs.top/image/20210509190545640.gif_char)

<font color=red>算法分析</font>

- **稳定性**：不稳定
- **时间复杂度** ：最佳：O(n2) ，最差：O(n2)， 平均：O(n2)
- **空间复杂度** ：O(1)
- **排序方式** ：In-place

```java
/**
 * 选择排序
 * @param arr
 * @return arr
 */
public static int[] selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            int tmp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = tmp;
        }
    }
    return arr;
}
```



<mark>插入排序</mark>

插入排序是一种简单直观的排序算法。插入排序在实现上，从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。

原理是<font color=orchid>通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入</font>。想想摸到扑克牌后，怎么放入。

插入排序和冒泡排序一样，也有一种优化算法，叫做拆半插入。

<font color=red>算法步骤</font>

1. 从第一个元素开始，该元素可以认为已经被排序；
2. 取出下一个元素，在已经排序的元素序列中从后向前扫描；
3. 如果该元素（已排序）大于新元素，将该元素移到下一位置；
4. 重复步骤 3，直到找到已排序的元素小于或者等于新元素的位置；
5. 将新元素插入到该位置后；
6. 重复步骤 2~5

<font color=red>图解</font>

![在这里插入图片描述](http://images.xyzzs.top/image/20210223174254141.gif_char)

<font color=red>算法分析</font>

- **稳定性**：稳定
- **时间复杂度** ：最佳：O(n) ，最差：O(n2)， 平均：O(n2)
- **空间复杂度** ：O(1)
- **排序方式** ：In-plac

```java
**
 * 插入排序
 * @param arr
 * @return arr
 */
public static int[] insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int preIndex = i - 1;
        int current = arr[i];
        while (preIndex >= 0 && current < arr[preIndex]) {
            arr[preIndex + 1] = arr[preIndex];
            preIndex -= 1;
        }
        arr[preIndex + 1] = current;
    }
    return arr;
}
```



<mark>希尔排序</mark>

希尔排序也是一种插入排序，它是简单插入排序经过改进之后的一个更高效的版本，也称为递减增量排序算法，同时该算法是冲破 `O(n²)` 的第一批算法之一。

希尔排序的基本思想是：先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，待整个序列中的记录 **基本有序** 时，再对全体记录进行依次直接插入排序。

<font color=red>算法步骤</font>

1. 先选定一个小于N的整数gap作为第一增量，然后将所有距离为gap的元素分在同一组，并对每一组的元素进行直接插入排序。然后再取一个比第一增量小的整数作为第二增量，重复上述操作…
2. 当增量的大小减到1时，就相当于整个序列被分到一组，进行一次直接插入排序，排序完成。

<font color=red>图解</font>

![在这里插入图片描述](http://images.xyzzs.top/image/20210509190237603.gif_char)

<font color=red>算法分析</font>

- **稳定性**：稳定
- **时间复杂度** ：最佳：O(nlogn)， 最差：O(n2) 平均：O(nlogn)
- **空间复杂度** ：`O(1)`

```java
/**
 * 希尔排序
 *
 * @param arr
 * @return arr
 */
public static int[] shellSort(int[] arr) {
    int n = arr.length;
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; i++) {
            int current = arr[i];
            int preIndex = i - gap;
            // Insertion sort
            while (preIndex >= 0 && arr[preIndex] > current) {
                arr[preIndex + gap] = arr[preIndex];
                preIndex -= gap;
            }
            arr[preIndex + gap] = current;

        }
        gap /= 2;
    }
    return arr;
}
```



<mark>归并排序</mark>

归并排序是建立在归并操作上的一种有效的排序算法。该算法是采用分治法 (Divide and Conquer) 的一个非常典型的应用。归并排序是一种稳定的排序方法。将已有序的子序列合并，得到完全有序的序列；即先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为 2 - 路归并。

和选择排序一样，归并排序的性能不受输入数据的影响，但表现比选择排序好的多，因为始终都是 `O(nlogn)` 的时间复杂度。代价是需要额外的内存空间

<font color=red>算法步骤</font>

归并排序算法是一个递归过程，边界条件为当输入序列仅有一个元素时，直接返回，具体过程如下：

1. 如果输入内只有一个元素，则直接返回，否则将长度为 `n` 的输入序列分成两个长度为 `n/2` 的子序列；
2. 分别对这两个子序列进行归并排序，使子序列变为有序状态；
3. 设定两个指针，分别指向两个已经排序子序列的起始位置；
4. 比较两个指针所指向的元素，选择相对小的元素放入到合并空间（用于存放排序结果），并移动指针到下一位置；
5. 重复步骤 3 ~4 直到某一指针达到序列尾；
6. 将另一序列剩下的所有元素直接复制到合并序列尾

<font color=red>图解</font>

![在这里插入图片描述](http://images.xyzzs.top/image/20201121130919764.gif_char)

<font color=red>算法分析</font>

- **稳定性**：稳定
- **时间复杂度** ：最佳：O(nlogn)， 最差：O(nlogn)， 平均：O(nlogn)
- **空间复杂度** ：O(n)

```java
**
 * 归并排序
 *
 * @param arr
 * @return arr
 */
public static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) {
        return arr;
    }
    int middle = arr.length / 2;
    int[] arr_1 = Arrays.copyOfRange(arr, 0, middle);
    int[] arr_2 = Arrays.copyOfRange(arr, middle, arr.length);
    return merge(mergeSort(arr_1), mergeSort(arr_2));
}

/**
 * Merge two sorted arrays
 *
 * @param arr_1
 * @param arr_2
 * @return sorted_arr
 */
public static int[] merge(int[] arr_1, int[] arr_2) {
    int[] sorted_arr = new int[arr_1.length + arr_2.length];
    int idx = 0, idx_1 = 0, idx_2 = 0;
    while (idx_1 < arr_1.length && idx_2 < arr_2.length) {
        if (arr_1[idx_1] < arr_2[idx_2]) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
        } else {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
        }
        idx += 1;
    }
    if (idx_1 < arr_1.length) {
        while (idx_1 < arr_1.length) {
            sorted_arr[idx] = arr_1[idx_1];
            idx_1 += 1;
            idx += 1;
        }
    } else {
        while (idx_2 < arr_2.length) {
            sorted_arr[idx] = arr_2[idx_2];
            idx_2 += 1;
            idx += 1;
        }
    }
    return sorted_arr;
}
```



<mark>快速排序</mark>

快速排序用到了分治思想，同样的还有归并排序。乍看起来快速排序和归并排序非常相似，都是将问题变小，先排序子串，最后合并。不同的是快速排序在划分子问题的时候经过多一步处理，将划分的两组数据划分为一大一小，这样在最后合并的时候就不必像归并排序那样再进行比较。但也正因为如此，划分的不定性使得快速排序的时间复杂度并不稳定。

快速排序的基本思想：通过一趟排序将待排序列分隔成独立的两部分，其中一部分记录的元素均比另一部分的元素小，则可分别对这两部分子序列继续进行排序，以达到整个序列有序。

<font color=red>算法步骤</font>

1. 从序列中**随机**（也可指定）挑出一个元素，做为 “基准”(`pivot`)；
2. 利用左右两个下标，分别指向头（left）和尾（right），将数组头部元素设为基准值（key），left往右走寻找比key大的值，right向左走寻找比key小的值（**right先出发**），双方都找到后交换left和right所指向的数组元素值；直到left和right相遇。相遇后交换key和相遇点的元素值（相遇点一定比key值小，所以需要交换值，原因right先走）;在这个操作结束之后，该基准就处于数列的中间位置。这个称为分区（partition）操作；
3. 递归地把小于基准值元素的子序列和大于基准值元素的子序列进行快速排序

<font color=red>图解</font>

<img src="http://images.xyzzs.top/image/1d08e3177f27446b85d7aed603281b0f.png_char" alt="img" style="zoom:67%;" />

<font color=red>算法分析</font>

- **稳定性** ：不稳定
- **时间复杂度** ：最佳：O(nlogn)， 最差：O(nlogn)，平均：O(nlogn)
- **空间复杂度** ：O(nlogn)

```java
public static int partition(int[] array, int low, int high) {
    int pivot = array[high];
    int pointer = low;
    for (int i = low; i < high; i++) {
        if (array[i] <= pivot) {
            int temp = array[i];
            array[i] = array[pointer];
            array[pointer] = temp;
            pointer++;
        }
        System.out.println(Arrays.toString(array));
    }
    int temp = array[pointer];
    array[pointer] = array[high];
    array[high] = temp;
    return pointer;
}
public static void quickSort(int[] array, int low, int high) {
    if (low < high) {
        int position = partition(array, low, high);
        quickSort(array, low, position - 1);
        quickSort(array, position + 1, high);
    }
}
```



<mark>堆排序</mark>

堆排序是指利用堆这种数据结构所设计的一种排序算法。堆是一个近似完全二叉树的结构，并同时满足**堆的性质**：即**子结点的值总是小于（或者大于）它的父节点**。

<font color=red>算法步骤</font>

1. 将初始待排序列 `(R1, R2, ……, Rn)` 构建成大顶堆，此堆为初始的无序区；
2. 将堆顶元素 `R[1]` 与最后一个元素 `R[n]` 交换，此时得到新的无序区 `(R1, R2, ……, Rn-1)` 和新的有序区 (Rn), 且满足 `R[1, 2, ……, n-1]<=R[n]`；
3. 由于交换后新的堆顶 `R[1]` 可能违反堆的性质，因此需要对当前无序区 `(R1, R2, ……, Rn-1)` 调整为新堆，然后再次将 R [1] 与无序区最后一个元素交换，得到新的无序区 `(R1, R2, ……, Rn-2)` 和新的有序区 `(Rn-1, Rn)`。不断重复此过程直到有序区的元素个数为 `n-1`，则整个排序过程完成。

<font color=red>图解</font>

![image-20230129170614656](http://images.xyzzs.top/image/heap_sort.gif_char)

<font color=red>算法分析</font>

- **稳定性** ：不稳定
- **时间复杂度** ：最佳：O(nlogn)， 最差：O(nlogn)， 平均：O(nlogn)
- **空间复杂度** ：O(1）

```java
// Global variable that records the length of an array;
static int heapLen;

/**
 * Swap the two elements of an array
 * @param arr
 * @param i
 * @param j
 */
private static void swap(int[] arr, int i, int j) {
    int tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

/**
 * Build Max Heap
 * @param arr
 */
private static void buildMaxHeap(int[] arr) {
    for (int i = arr.length / 2 - 1; i >= 0; i--) {
        heapify(arr, i);
    }
}

/**
 * Adjust it to the maximum heap
 * @param arr
 * @param i
 */
private static void heapify(int[] arr, int i) {
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    int largest = i;
    if (right < heapLen && arr[right] > arr[largest]) {
        largest = right;
    }
    if (left < heapLen && arr[left] > arr[largest]) {
        largest = left;
    }
    if (largest != i) {
        swap(arr, largest, i);
        heapify(arr, largest);
    }
}

/**
 * Heap Sort
 * @param arr
 * @return
 */
public static int[] heapSort(int[] arr) {
    // index at the end of the heap
    heapLen = arr.length;
    // build MaxHeap
    buildMaxHeap(arr);
    for (int i = arr.length - 1; i > 0; i--) {
        // Move the top of the heap to the tail of the heap in turn
        swap(arr, 0, i);
        heapLen -= 1;
        heapify(arr, 0);
    }
    return arr;
}
```



<mark>计数排序</mark>

计数排序的核心在于将输入的数据值转化为键存储在额外开辟的数组空间中。 作为一种线性时间复杂度的排序，**计数排序要求输入的数据必须是有确定范围的整数**。

计数排序 (Counting sort) 是一种稳定的排序算法。计数排序使用一个额外的数组 `C`，其中第 `i` 个元素是待排序数组 `A` 中值等于 `i` 的元素的个数。然后根据数组 `C` 来将 `A` 中的元素排到正确的位置。**它只能对整数进行排序**

<font color=red>算法步骤</font>

1. 找出数组中的最大值 `max`、最小值 `min`；
2. 创建一个新数组 `C`，其长度是 `max-min+1`，其元素默认值都为 0；
3. 遍历原数组 `A` 中的元素 `A[i]`，以 `A[i]-min` 作为 `C` 数组的索引，以 `A[i]` 的值在 `A` 中元素出现次数作为 `C[A[i]-min]` 的值；
4. 对 `C` 数组变形，**新元素的值是该元素与前一个元素值的和**，即当 `i>1` 时 `C[i] = C[i] + C[i-1]`；
5. 创建结果数组 `R`，长度和原始数组一样。
6. **从后向前**遍历原始数组 `A` 中的元素 `A[i]`，使用 `A[i]` 减去最小值 `min` 作为索引，在计数数组 `C` 中找到对应的值 `C[A[i]-min]`，`C[A[i]-min]-1` 就是 `A[i]` 在结果数组 `R` 中的位置，做完上述这些操作，将 `count[A[i]-min]` 减小 1。

<font color=red>图解</font>

![image-20230129171029417](http://images.xyzzs.top/image/counting_sort.gif_char)

<font color=red>算法分析</font>

对于数据范围很大的数组，需要大量额外内存空间。

- **稳定性** ：稳定
- **时间复杂度** ：最佳：`O(n+k)` 最差：`O(n+k)` 平均：`O(n+k)`
- **空间复杂度** ：`O(k)`

```java
/**
 * Gets the maximum and minimum values in the array
 *
 * @param arr
 * @return
 */
private static int[] getMinAndMax(int[] arr) {
    int maxValue = arr[0];
    int minValue = arr[0];
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] > maxValue) {
            maxValue = arr[i];
        } else if (arr[i] < minValue) {
            minValue = arr[i];
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 * Counting Sort
 *
 * @param arr
 * @return
 */
public static int[] countingSort(int[] arr) {
    if (arr.length < 2) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int[] countArr = new int[maxValue - minValue + 1];
    int[] result = new int[arr.length];

    for (int i = 0; i < arr.length; i++) {
        countArr[arr[i] - minValue] += 1;
    }
    for (int i = 1; i < countArr.length; i++) {
        countArr[i] += countArr[i - 1];
    }
    for (int i = arr.length - 1; i >= 0; i--) {
        int idx = countArr[arr[i] - minValue] - 1;
        result[idx] = arr[i];
        countArr[arr[i] - minValue] -= 1;
    }
    return result;
}
```



<mark>桶排序</mark>

桶排序是计数排序的升级版。它利用了函数的映射关系，高效与否的关键就在于这个映射函数的确定。为了使桶排序更加高效，我们需要做到这两点：

1. 在额外空间充足的情况下，尽量增大桶的数量
2. 使用的映射函数能够将输入的 N 个数据均匀的分配到 K 个桶中

桶排序的工作的原理：假设输入数据服从均匀分布，将数据分到有限数量的桶里，每个桶再分别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行

<font color=red>算法步骤</font>

1. 设置一个 BucketSize，作为每个桶所能放置多少个不同数值；
2. 遍历输入数据，并且把数据依次映射到对应的桶里去；
3. 对每个非空的桶进行排序，可以使用其它排序方法，也可以递归使用桶排序；
4. 从非空桶里把排好序的数据拼接起来

<font color=red>图解</font>

![image-20230129172523087](http://images.xyzzs.top/image/bucket_sort.gif_char)

<font color=red>算法分析</font>

- **稳定性** ：稳定
- **时间复杂度** ：最佳：`O(n+k)` 最差：`O(n²)` 平均：`O(n+k)`
- **空间复杂度** ：`O(k)`

```java
**
 * Gets the maximum and minimum values in the array
 * @param arr
 * @return
 */
private static int[] getMinAndMax(List<Integer> arr) {
    int maxValue = arr.get(0);
    int minValue = arr.get(0);
    for (int i : arr) {
        if (i > maxValue) {
            maxValue = i;
        } else if (i < minValue) {
            minValue = i;
        }
    }
    return new int[] { minValue, maxValue };
}

/**
 * Bucket Sort
 * @param arr
 * @return
 */
public static List<Integer> bucketSort(List<Integer> arr, int bucket_size) {
    if (arr.size() < 2 || bucket_size == 0) {
        return arr;
    }
    int[] extremum = getMinAndMax(arr);
    int minValue = extremum[0];
    int maxValue = extremum[1];
    int bucket_cnt = (maxValue - minValue) / bucket_size + 1;
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < bucket_cnt; i++) {
        buckets.add(new ArrayList<Integer>());
    }
    for (int element : arr) {
        int idx = (element - minValue) / bucket_size;
        buckets.get(idx).add(element);
    }
    for (int i = 0; i < buckets.size(); i++) {
        if (buckets.get(i).size() > 1) {
            buckets.set(i, sort(buckets.get(i), bucket_size / 2));
        }
    }
    ArrayList<Integer> result = new ArrayList<>();
    for (List<Integer> bucket : buckets) {
        for (int element : bucket) {
            result.add(element);
        }
    }
    return result;
}
```



<mark>基数排序</mark>

基数排序也是非比较的排序算法，对元素中的每一位数字进行排序，从最低位开始排序，复杂度为 `O(n×k)`，`n` 为数组长度，`k` 为数组中元素的最大的位数；

基数排序是按照低位先排序，然后收集；再按照高位排序，然后再收集；依次类推，直到最高位。有时候有些属性是有优先级顺序的，先按低优先级排序，再按高优先级排序。最后的次序就是高优先级高的在前，高优先级相同的低优先级高的在前。基数排序基于分别排序，分别收集，所以是稳定的

<font color=red>算法步骤</font>

1. 取得数组中的最大数，并取得位数，即为迭代次数 `N`（例如：数组中最大数值为 1000，则 `N=4`）；
2. `A` 为原始数组，从最低位开始取每个位组成 `radix` 数组；
3. 对 `radix` 进行计数排序（利用计数排序适用于小范围数的特点）；
4. 将 `radix` 依次赋值给原数组；
5. 重复 2~4 步骤 `N` 次

<font color=red>图解</font>

![image-20230129172710373](http://images.xyzzs.top/image/radix_sort.gif_char)

<font color=red>算法分析</font>

- **稳定性** ：稳定
- **时间复杂度** ：最佳：`O(n×k)` 最差：`O(n×k)` 平均：`O(n×k)`
- **空间复杂度** ：`O(n+k)`

```java
/**
 * Radix Sort
 *
 * @param arr
 * @return
 */
public static int[] radixSort(int[] arr) {
    if (arr.length < 2) {
        return arr;
    }
    int N = 1;
    int maxValue = arr[0];
    for (int element : arr) {
        if (element > maxValue) {
            maxValue = element;
        }
    }
    while (maxValue / 10 != 0) {
        maxValue = maxValue / 10;
        N += 1;
    }
    for (int i = 0; i < N; i++) {
        List<List<Integer>> radix = new ArrayList<>();
        for (int k = 0; k < 10; k++) {
            radix.add(new ArrayList<Integer>());
        }
        for (int element : arr) {
            int idx = (element / (int) Math.pow(10, i)) % 10;
            radix.get(idx).add(element);
        }
        int idx = 0;
        for (List<Integer> l : radix) {
            for (int n : l) {
                arr[idx++] = n;
            }
        }
    }
    return arr;
}
```



### 散列函数

时间复杂度：

​                写操作：O(1) + O(n) = O(n) n 为单链元素个数

​                读操作：O(1) + O(n) n 为单链元素个数

​                Hash冲突写单链表：O(n)

​                Hash扩容：O(n) n是数组元素个数 rehash

​                Hash冲突读单链表：O(n) n为单链元素个数        

优缺点：读写快，但是Hash表中元素没有被排序、Hash冲突、扩容需要重新计算hash

应用：HashMap，Redis字典，布隆过滤器，位图





<!-- https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html -->
