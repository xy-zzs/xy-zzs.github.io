import{_ as p}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as c,o as l,c as i,a as n,b as a,d as e,w as t,f as o}from"./app-DmhNJ90i.js";const u={},r=o('<h1 id="并发导航栏" tabindex="-1"><a class="header-anchor" href="#并发导航栏"><span>并发导航栏</span></a></h1><h2 id="中断机制之协商中断" tabindex="-1"><a class="header-anchor" href="#中断机制之协商中断"><span>中断机制之协商中断</span></a></h2><ol><li><p>volatile实现中断</p></li><li><p>AtomicBoolean实现中断</p></li><li><p>Thread自带中断API</p><ul><li><p><strong>interrupt</strong>：设置中断状态位为true，表示请求中断</p></li><li><p><strong>isInterrupted</strong>：取出中断状态位布尔值，判断是否中断</p></li><li><p>Thread.interrupted：取出设置的中断状态位布尔值，取出后，清除状态位为false，静态方法</p></li></ul></li></ol><p><strong>坑</strong>：interrupt在打断请求其他线程时，如其他线程正在sleep()、wait()、join()，会报InterruptException异常，中断标志位会被清除为false，需在catch中重新设置中断标志位为true</p><h2 id="等待通知机制" tabindex="-1"><a class="header-anchor" href="#等待通知机制"><span>等待通知机制</span></a></h2>',5),d=n("li",null,[a("Object.wait() Object.notify "),n("ul",null,[n("li",null,"必须在synchronized中"),n("li",null,"先wait才notify，否则无法唤醒")])],-1),k=n("li",null,[a("Lock. Condition.await() Condition.signal() "),n("ul",null,[n("li",null,"必须在lock和unlock中"),n("li",null,"先wait才notify，否则无法唤醒")])],-1),m=n("li",null,[n("strong",null,"可在任意位置")],-1),g=n("li",null,"可先放行",-1),h=n("h2",{id:"jmm",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#jmm"},[n("span",null,"JMM")])],-1),v=n("p",null,"Java内存模型（Java Memory Model）",-1),b=n("figure",null,[n("img",{src:"http://images.xyzzs.top/image/image-20230204152749811.png_char",alt:"image-20230204152749811",tabindex:"0",loading:"lazy"}),n("figcaption",null,"image-20230204152749811")],-1),y=o("<p>❓<strong>为什么要遵守这些并发相关的原则和规范呢？</strong></p><p>因为并发编程下，像 CPU 多级缓存和指令重排（为了提升CPU性能）这类设计可能会导致程序运行出现一些问题。为此，设计 happens-before 原则来解决这个指令重排序问题。</p><p>JMM 说白了就是定义了一些规范来解决这些问题，开发者可以利用这些规范更方便地开发多线程程序。对于 Java 开发者说，你不需要了解底层原理，直接使用并发相关的一些关键字和类（比如 <code>volatile</code>、<code>synchronized</code>、各种 <code>Lock</code>）即可开发出并发安全的程序。</p><p>关于主内存与工作内存直接的具体交互协议，即一个变量如何从主内存拷贝到工作内存，如何从工作内存同步到主内存之间的实现细节，Java 内存模型定义来以下八种同步操作（了解即可，无需死记硬背）：</p><ul><li><strong>锁定（lock）</strong>: 作用于主内存中的变量，将他标记为一个线程独享变量。</li><li><strong>解锁（unlock）</strong>: 作用于主内存中的变量，解除变量的锁定状态，被解除锁定状态的变量才能被其他线程锁定。</li><li><strong>read（读取）</strong>：作用于主内存的变量，它把一个变量的值从主内存传输到线程的工作内存中，以便随后的 load 动作使用。</li><li><strong>load(载入)</strong>：把 read 操作从主内存中得到的变量值放入工作内存的变量的副本中。</li><li><strong>use(使用)</strong>：把工作内存中的一个变量的值传给执行引擎，每当虚拟机遇到一个使用到变量的指令时都会使用该指令。</li><li><strong>assign（赋值）</strong>：作用于工作内存的变量，它把一个从执行引擎接收到的值赋给工作内存的变量，每当虚拟机遇到一个给变量赋值的字节码指令时执行这个操作。</li><li><strong>store（存储）</strong>：作用于工作内存的变量，它把工作内存中一个变量的值传送到主内存中，以便随后的 write 操作使用。</li><li><strong>write（写入）</strong>：作用于主内存的变量，它把 store 操作从工作内存中得到的变量的值放入主内存的变量中</li></ul><p>除了这 8 种同步操作之外，还规定了下面这些同步规则来保证这些同步操作的正确执行（了解即可，无需死记硬背）：</p><ul><li>不允许一个线程无原因地（没有发生过任何 assign 操作）把数据从线程的工作内存同步回主内存中。</li><li>一个新的变量只能在主内存中 “诞生”，不允许在工作内存中直接使用一个未被初始化（load 或 assign）的变量，换句话说就是对一个变量实施 use 和 store 操作之前，必须先执行过了 assign 和 load 操作。</li><li>一个变量在同一个时刻只允许一条线程对其进行 lock 操作，但 lock 操作可以被同一条线程重复执行多次，多次执行 lock 后，只有执行相同次数的 unlock 操作，变量才会被解锁。</li><li>如果对一个变量执行 lock 操作，将会清空工作内存中此变量的值，在执行引擎使用这个变量前，需要重新执行 load 或 assign 操作初始化变量的值。</li><li>如果一个变量事先没有被 lock 操作锁定，则不允许对它执行 unlock 操作，也不允许去 unlock 一个被其他线程锁定住的变量。</li></ul><p><strong>为什么需要 happens-before 原则？</strong> happens-before 原则的诞生是为了程序员和编译器、处理器之间的平衡。程序员追求的是易于理解和编程的强内存模型。编译器和处理器追求的是较少约束的弱内存模型，让它们尽己所能地去优化性能，让性能最大化。happens-before 原则的设计思想其实非常简单：</p><ul><li>为了对编译器和处理器的约束尽可能少，只要不改变程序的执行结果（单线程程序和正确执行的多线程程序），编译器和处理器怎么进行重排序优化都行。</li><li>对于会改变程序执行结果的重排序，JMM 要求编译器和处理器必须禁止这种重排序。</li></ul><p>了解了 happens-before 原则的设计思想，我们再来看看 happens-before 的规则，这规则写的跟开玩笑一样，胜似听君一席话</p>",10),f=n("li",null,[n("p",null,[n("strong",null,"程序顺序规则"),a("（Program Order Rule）：一个线程内，按照代码顺序，书写在前面的操作 优先行发生 于书写在后面的操作；")])],-1),_=n("strong",null,"解锁规则",-1),A=n("strong",null,"volatile 变量规则",-1),C=o("<li><p><strong>传递规则</strong>（Transitivity） ：如果 A 先行发生 B，且 B 先行发生 C，那么 A 先行发生 C；</p></li><li><p><strong>线程启动规则</strong>（Thread Start Rule）：Thread 对象的 <code>start()</code>方法 happens-before 于此线程的每一个动作。</p></li><li><p>线程终止规则（Thread Termination Rule）：线程中的所有操作都先行发生于对此线程的终止检测，我们可以通过Thread::join()方法是否结束、Thread::isAlive()的返回值等手段检测线程是否已经终止执行。</p></li><li><p>线程中断规则（Thread Interruption Rule）：对线程interrupt()方法的调用先行发生于被中断线程的代码检测到中断事件的发生，可以通过Thread::interrupted()方法检测到是否有中断发生。</p></li><li><p>对象终结规则（Finalizer Rule）：一个对象的初始化完成（构造函数执行结束）先行发生于它的 finalize()方法的开始。</p></li>",5),z=o('<h2 id="volatile关键字" tabindex="-1"><a class="header-anchor" href="#volatile关键字"><span>volatile关键字</span></a></h2><p><code>volatile</code> 关键字其实并非是 Java 语言特有的，在 C 语言里也有，它最原始的意义就是禁用 CPU 缓存。如果我们将一个变量使用 <code>volatile</code> 修饰，这就指示 编译器，这个变量是共享且不稳定的，每次使用它都到主存中进行读取。</p><p><strong>在 Java 中，<code>volatile</code> 关键字除了可以保证变量的可见性，还有一个重要的作用就是防止 JVM 的指令重排序。</strong> 如果我们将变量声明为 <strong><code>volatile</code></strong> ，在对这个变量进行读写操作的时候，会通过插入特定的 <strong>内存屏障</strong> 的方式来禁止指令重排序。</p><p><code>volatile</code> 关键字不能保证对变量的操作是原子性的，<code>synchronized</code> 关键字能保证原子性。</p><h2 id="synchronized-关键字" tabindex="-1"><a class="header-anchor" href="#synchronized-关键字"><span>synchronized 关键字</span></a></h2><p><code>synchronized</code> 关键字的使用方式主要有下面 3 种：</p><ol><li><strong>修饰实例方法</strong> （锁当前对象实例）：</li><li><strong>修饰静态方法</strong> （锁当前类）</li><li><strong>修饰代码块</strong> （锁指定对象/类）</li></ol><p><code>synchronized</code> 同步语句块的实现使用的是 <code>monitorenter</code> 和 <code>monitorexit</code> 指令，其中 <code>monitorenter</code> 指令指向同步代码块的开始位置，<code>monitorexit</code> 指令则指明同步代码块的结束位置。</p><p><code>synchronized</code> 修饰的方法并没有 <code>monitorenter</code> 指令和 <code>monitorexit</code> 指令，取得代之的确实是 <code>ACC_SYNCHRONIZED</code> 标识，该标识指明了该方法是一个同步方法。</p><p><strong>不过两者的本质都是对对象监视器 monitor 的获取</strong></p><p>JDK1.6 对锁的实现引入了大量的优化，如偏向锁、轻量级锁、自旋锁、适应性自旋锁、锁消除、锁粗化等技术来减少锁操作的开销。</p><p>锁主要存在四种状态，依次是：无锁状态、偏向锁状态、轻量级锁状态、重量级锁状态，他们会随着竞争的激烈而逐渐升级。注意锁可以升级不可降级，这种策略是为了提高获得锁和释放锁的效率。</p><p>对象头 16字节：对象标记 8 字节（细节如下图） + 类信息 8 字节</p><figure><img src="http://images.xyzzs.top/image/1671712156967-d3e28480-bdf5-4bda-a657-beb5301e6698.png_char_char" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure>',14),S=n("strong",null,"偏向锁原理和升级过程",-1),x=n("code",null,"threadID",-1),w=n("code",null,"threadID",-1),j=n("code",null,"threadID",-1),L=n("li",null,[n("p",null,[a("如果一致（还是线程 A 获取锁对象），则无需使用"),n("code",null,"CAS"),a("来加锁、解锁；")])],-1),T=n("code",null,"threadID",-1),F=n("li",null,[n("p",null,"如果没有存活，那么锁对象被重置为无锁状态，其它线程（线程 B ）可以竞争将其设置为偏向锁；")],-1),q=n("ul",null,[n("li",null,"如果还是需要继续持有这个锁对象，那么暂停当前线程 A ，撤销偏向锁，升级为轻量级锁，"),n("li",null,"如果线程 A 不再使用该锁对象，那么将锁对象状态设为无锁状态，重新偏向新的线程。")],-1),J=o(`<p>⚠️慎用Integer，String，他们在实现上都用了享元模式，即值在一定范围内，对象是同一个，所以看似是用了不同的对象，其实用的是同一个对象，会导致一个锁被多个地方使用</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token class-name">Integer</span> count<span class="token punctuation">;</span>
<span class="token keyword">synchronized</span> <span class="token punctuation">(</span>count<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><mark>JIT编译器对锁的优化</mark></p><p><strong>锁消除</strong>：从JIT角度看相当于无视它,这个锁对象并没有被共用扩散到其它线程使用，没有加这个锁对象的底层机器码，消除了锁的作用</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//锁消除：从JIT角度看相当于无视它,这个锁对象并没有被共用扩散到其它线程使用</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LockClearUPDemo</span> <span class="token punctuation">{</span>
 
    <span class="token keyword">static</span> <span class="token class-name">Object</span> objectLock <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Object</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//正常的,有且仅有同一把锁</span>

    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">m1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 锁消除 ,JIT 会无视它， synchronized( 对象锁 ) 不存在了。不正常的</span>
        <span class="token class-name">Object</span> objectLock <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Object</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//锁消除,来一个\`new\`一个，相当于每个线程持有一把锁，都能进入</span>
        <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;----hello lock&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>锁粗化</strong>：假如方法中首尾相接，前后相邻的都是同一个锁对象，那JIT编译器就会把这几个synchronized块合并成一个大块，加粗加大范围，一次申请锁使用即可，避免次次的申请和释放锁，提升了性能。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LockBigDemo</span> <span class="token punctuation">{</span>
 
    <span class="token keyword">static</span> <span class="token class-name">Object</span> objectLock <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Object</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">new</span> <span class="token class-name">Thread</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;11111&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
 
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;22222&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
 
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;33333&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token string">&quot;a&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 
        <span class="token keyword">new</span> <span class="token class-name">Thread</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;44444&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;55555&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>objectLock<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;66666&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token string">&quot;b&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="cas" tabindex="-1"><a class="header-anchor" href="#cas"><span>CAS</span></a></h2><p>compare and swap</p><p>CAS 用于实现乐观锁，被广泛应用于各大框架中。CAS 的思想很简单，就是用一个预期值和要更新的变量值进行比较，两值相等才会进行更新。</p><p>Java 语言并没有直接实现 CAS，CAS 相关的实现是通过 unsafe类以C语言调用操作系统，底层依赖于一条 CPU 的原子指令(<code>cmpxchg</code>指令)。因此， CAS 的具体实现和操作系统以及CPU都有关系。</p><p>优点：轻量级加锁；资源竞争不大的场景系统开销小。</p><p>缺点：</p><ul><li>长时间未获得锁，CPU空转，循环时间长开销大，浪费资源，高并发下性能下降</li><li>只能保证一个共享变量的原子操作，CAS 只对单个共享变量有效，当操作涉及跨多个共享变量时 CAS 无效。可以把多个变量放在一个对象里来进行 CAS 操作，利用<code>AtomicReference</code>类</li></ul><h2 id="原子操作类" tabindex="-1"><a class="header-anchor" href="#原子操作类"><span>原子操作类</span></a></h2><p>根据操作的数据类型，可以将 JUC 包中的原子类分为 4 类</p><p><strong>基本类型</strong></p><p>使用原子的方式更新基本类型</p><ul><li><code>AtomicInteger</code>：整型原子类</li><li><code>AtomicLong</code>：长整型原子类</li><li><code>AtomicBoolean</code> ：布尔型原子类</li></ul><p><strong>数组类型</strong></p><p>使用原子的方式更新数组里的某个元素</p><ul><li><code>AtomicIntegerArray</code>：整型数组原子类</li><li><code>AtomicLongArray</code>：长整型数组原子类</li><li><code>AtomicReferenceArray</code> ：引用类型数组原子类</li></ul><p><strong>引用类型</strong></p><ul><li><code>AtomicReference</code>：引用类型原子类</li><li><code>AtomicMarkableReference</code>：原子更新带有标记的引用类型。该类将 boolean 标记与引用关联起来。</li><li><code>AtomicStampedReference</code> ：原子更新带有版本号的引用类型。该类将整数值与引用关联起来，可用于解决原子的更新数据和数据的版本号，可以解决使用 CAS 进行原子更新时可能出现的 ABA 问题。</li></ul><p><strong>对象的属性修改类型</strong></p><ul><li><code>AtomicIntegerFieldUpdater</code>:原子更新整型字段的更新器</li><li><code>AtomicLongFieldUpdater</code>：原子更新长整型字段的更新器</li><li><code>AtomicReferenceFieldUpdater</code>：原子更新引用类型里的字段</li></ul><p><code>AtomicInteger</code> 类主要利用 CAS (compare and swap) + volatile 和 native 方法来保证原子操作，从而避免 synchronized 的高开销，执行效率大为提升。</p><p>CAS 的原理是拿期望的值和原本的一个值作比较，如果相同则更新成新的值。UnSafe 类的 <code>objectFieldOffset()</code> 方法是一个本地方法，这个方法是用来拿到“原来的值”的内存地址。另外 value 是一个 volatile 变量，在内存中可见，因此 JVM 可以保证任何时刻任何线程总能拿到该变量的最新值</p><p><strong>JDK8新增，推介使用，比AtomicLong性能更好，减少乐观锁重试次数</strong></p><ul><li>DoubleAccumulator</li><li>DoubleAdder</li><li>LongAccumulator：提供了自定义的函数操作</li><li>LongAdder：只能用来计算加法，且从零开始计算</li></ul><h2 id="threadlocal-线程局部变量" tabindex="-1"><a class="header-anchor" href="#threadlocal-线程局部变量"><span>ThreadLocal（线程局部变量）</span></a></h2><p><mark>ThreadLocal 内存泄露问题是怎么导致的？</mark></p><figure><img src="http://images.xyzzs.top/image/image-20230204174406473.png_char" alt="image-20230204174406473" tabindex="0" loading="lazy"><figcaption>image-20230204174406473</figcaption></figure><p><code>ThreadLocalMap</code> 中使用的 key 为 <code>ThreadLocal</code> 的弱引用，而 value 是强引用。所以，如果 <code>ThreadLocal</code> 没有被外部强引用的情况下，在垃圾回收的时候，key 会被清理掉，而 value 不会被清理掉。</p><p>这样一来，<code>ThreadLocalMap</code> 中就会出现 key 为 null 的 Entry。假如我们不做任何措施的话，value 永远无法被 GC 回收，这个时候就可能会产生内存泄露。<code>ThreadLocalMap</code> 实现中已经考虑了这种情况，在调用 <code>set()</code>、<code>get()</code>、<code>remove()</code> 方法的时候，会清理掉 key 为 null 的记录。使用完 <code>ThreadLocal</code>方法后 最好手动调用<code>remove()</code>方法</p><p><mark>为什么源代码用弱引用?</mark> 方法执行完毕后，栈销毁强引用 也就没有了。但此时线程的 ThreadLocaMap 里某个entry的key引用还指向这个对象</p><ul><li>当这个key引用是强引用，就会导致key指向的ThreadLoca对象及v指向的对象不能被gc回收，造成内存泄漏；</li><li>当这个key引用是弱引用就大概率会减少内存泄漏的问题。使用弱引用,就可以使 ThreadLocal 对象在方法执行完毕后顺利被回收。线程池中线程经常会被复用，使用完后，应该清除remove</li></ul><figure><img src="http://images.xyzzs.top/image/image-20230204183818078.png_char" alt="image-20230204183818078" tabindex="0" loading="lazy"><figcaption>image-20230204183818078</figcaption></figure><p>ThreadLocalMap 使用 ThreadLocal 的弱引用作为 key ，如果一个 ThreadLocal 没有外部强引用引用他，那么系统 GC 的时候，这个 ThreadLocal 势必会被回收，这样一来，ThreadLocalMap 中就会出现 key 为 null 的 Entry ，就没有办法访问这些 key 为 null 的 Entry 的 value，如果当前线程再迟迟不结束的话(比如正好用在线程池)，这些 key 为 nul 的 Entry 的 value 就会一直存在一条强引用链。</p><h2 id="aqs" tabindex="-1"><a class="header-anchor" href="#aqs"><span>AQS</span></a></h2><p>AQS 的全称为 <code>AbstractQueuedSynchronizer</code> ，翻译过来的意思就是抽象队列同步器。这个类在 <code>java.util.concurrent.locks</code> 包下面。AQS 就是一个抽象类，主要用来构建锁和同步器。</p><p>AQS 核心思想是，如果被请求的共享资源空闲，则将当前请求资源的线程设置为有效的工作线程，并且将共享资源设置为锁定状态。如果被请求的共享资源被占用，那么就需要一套线程阻塞等待以及被唤醒时锁分配的机制，这个机制 AQS 是用 <strong>CLH 队列锁</strong> 实现的，即将暂时获取不到锁的线程加入到队列中。</p><p>CLH(Craig,Landin,and Hagersten) 队列是一个虚拟的双向队列（虚拟的双向队列即不存在队列实例，仅存在结点之间的关联关系）。AQS 是将每条请求共享资源的线程封装成一个 CLH 锁队列的一个结点（Node）来实现锁的分配。在 CLH 同步队列中，一个节点表示一个线程，它保存着线程的引用（thread）、 当前节点在队列中的状态（waitStatus）、前驱节点（prev）、后继节点（next）。</p><p>CLH 队列结构如下图所示</p><figure><img src="http://images.xyzzs.top/image/image-20230204190149853.png_char" alt="image-20230204190149853" tabindex="0" loading="lazy"><figcaption>image-20230204190149853</figcaption></figure><p>核心原理图</p><figure><img src="http://images.xyzzs.top/image/image-20230204190236265.png_char" alt="image-20230204190236265" tabindex="0" loading="lazy"><figcaption>image-20230204190236265</figcaption></figure><p>AQS 使用 <strong>int 成员变量 <code>state</code> 表示同步状态</strong>，通过内置的 <strong>线程等待队列</strong> 来完成获取资源线程的排队工作。</p><p><code>state</code> 变量由 <code>volatile</code> 修饰，用于展示当前临界资源的获锁情况。</p><p>以 <code>ReentrantLock</code> 为例，<code>state</code> 初始值为 0，表示未锁定状态。A 线程 <code>lock()</code> 时，会调用 <code>tryAcquire()</code> 独占该锁并将 <code>state+1</code> 。此后，其他线程再 <code>tryAcquire()</code> 时就会失败，直到 A 线程 <code>unlock()</code> 到 <code>state=</code>0（即释放锁）为止，其它线程才有机会获取该锁。当然，释放锁之前，A 线程自己是可以重复获取此锁的（<code>state</code> 会累加），这就是可重入的概念。但要注意，获取多少次就要释放多少次，这样才能保证 state 是能回到零态的。</p><p>再以 <code>CountDownLatch</code> 以例，任务分为 N 个子线程去执行，<code>state</code> 也初始化为 N（注意 N 要与线程个数一致）。这 N 个子线程是并行执行的，每个子线程执行完后<code>countDown()</code> 一次，state 会 CAS(Compare and Swap) 减 1。等到所有子线程都执行完后(即 <code>state=0</code> )，会 <code>unpark()</code> 主调用线程，然后主调用线程就会从 <code>await()</code> 函数返回，继续后余动作。</p><h2 id="semaphore" tabindex="-1"><a class="header-anchor" href="#semaphore"><span>Semaphore</span></a></h2><p><code>Semaphore</code>(信号量)可以用来控制同时访问特定资源的线程数量。</p><p>Semaphore 的使用简单，我们这里假设有 N(N&gt;5) 个线程来获取 <code>Semaphore</code> 中的共享资源，下面的代码表示同一时刻 N 个线程中只有 5 个线程能获取到共享资源，其他线程都会阻塞，只有获取到共享资源的线程才能执行。等到有线程释放了共享资源，其他阻塞的线程才能获取到。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// 初始共享资源数量</span>
<span class="token keyword">final</span> <span class="token class-name">Semaphore</span> semaphore <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Semaphore</span><span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 获取1个许可</span>
semaphore<span class="token punctuation">.</span><span class="token function">acquire</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 释放1个许可</span>
semaphore<span class="token punctuation">.</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><mark>Semaphore 的原理</mark></p><p><code>Semaphore</code> 是共享锁的一种实现，它默认构造 AQS 的 <code>state</code> 值为 <code>permits</code>，你可以将 <code>permits</code> 的值理解为许可证的数量，只有拿到许可证的线程才能执行。</p><h2 id="completablefuture" tabindex="-1"><a class="header-anchor" href="#completablefuture"><span>CompletableFuture</span></a></h2><p><code>CompletableFuture</code> 同时实现了 <code>Future</code> 和 <code>CompletionStage</code> 接口。</p><p>除了提供了更为好用和强大的 <code>Future</code> 特性之外，还提供了函数式编程的能力。</p><p><code>Future</code> 接口有 5 个方法：</p><ul><li><code>boolean cancel(boolean mayInterruptIfRunning)</code> ：尝试取消执行任务。</li><li><code>boolean isCancelled()</code> ：判断任务是否被取消。</li><li><code>boolean isDone()</code> ： 判断任务是否已经被执行完成。</li><li><code>get()</code> ：等待任务执行完成并获取运算结果。</li><li><code>get(long timeout, TimeUnit unit)</code> ：多了一个超时时间。</li></ul><p><code>CompletionStage&lt;T&gt;</code> 接口中的方法比较多，<code>CompletableFuture</code> 的函数式能力就是这个接口赋予的。从这个接口的方法参数你就可以发现其大量使用了 Java8 引入的函数式编程。</p><h3 id="创建" tabindex="-1"><a class="header-anchor" href="#创建"><span>创建</span></a></h3><p>常见的创建 <code>CompletableFuture</code> 对象的方法如下：</p><ol><li>通过 new 关键字。</li><li>基于 <code>CompletableFuture</code> 自带的静态工厂方法：<code>runAsync()</code> 、<code>supplyAsync()</code> 。</li></ol><h3 id="处理异步结算的结果" tabindex="-1"><a class="header-anchor" href="#处理异步结算的结果"><span>处理异步结算的结果</span></a></h3><p>当我们获取到异步计算的结果之后，还可以对其进行进一步的处理，比较常用的方法有下面几个：</p><ul><li><code>thenApply()</code></li><li><code>thenAccept()</code></li><li><code>thenRun()</code></li><li><code>whenComplete()</code></li></ul><p><strong>如果你不需要从回调函数中获取返回结果，可以使用 <code>thenAccept()</code> 或者 <code>thenRun()</code>。这两个方法的区别在于 <code>thenRun()</code> 不能访问异步计算的结果。</strong></p><h3 id="异常处理" tabindex="-1"><a class="header-anchor" href="#异常处理"><span>异常处理</span></a></h3><p>你可以通过 <code>handle()</code> 方法来处理任务执行过程中可能出现的抛出异常的情况。</p><h3 id="组合-completablefuture" tabindex="-1"><a class="header-anchor" href="#组合-completablefuture"><span>组合 CompletableFuture</span></a></h3><p>你可以使用 <code>thenCompose()</code> 按顺序链接两个 <code>CompletableFuture</code> 对象。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> completableFuture <span class="token operator">=</span> <span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">supplyAsync</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token string">&quot;hello!&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> completableFuture2 <span class="token operator">=</span> <span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">supplyAsync</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> s <span class="token operator">+</span> <span class="token string">&quot;world!&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> future <span class="token operator">=</span> completableFuture<span class="token punctuation">.</span><span class="token function">thenCompose</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> completableFuture2<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="并行运行多个-completablefuture" tabindex="-1"><a class="header-anchor" href="#并行运行多个-completablefuture"><span>并行运行多个 CompletableFuture</span></a></h3><p>可以通过 <code>CompletableFuture</code> 的 <code>allOf()</code>这个静态方法来并行运行多个 <code>CompletableFuture</code> 。</p><p>实际项目中，我们经常需要并行运行多个互不相关的任务，这些任务之间没有依赖关系，可以互相独立地运行。</p><p>比说我们要读取处理 6 个文件，这 6 个任务都是没有执行顺序依赖的任务，但是我们需要返回给用户的时候将这几个文件的处理的结果进行统计整理。像这种情况我们就可以使用并行运行多个 <code>CompletableFuture</code> 来处理。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Void</span><span class="token punctuation">&gt;</span></span> task1 <span class="token operator">=</span>
  <span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">supplyAsync</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">-&gt;</span><span class="token punctuation">{</span>
    <span class="token comment">//自定义业务操作</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
<span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Void</span><span class="token punctuation">&gt;</span></span> task6 <span class="token operator">=</span>
  <span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">supplyAsync</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">-&gt;</span><span class="token punctuation">{</span>
    <span class="token comment">//自定义业务操作</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
 <span class="token class-name">CompletableFuture</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Void</span><span class="token punctuation">&gt;</span></span> headerFuture<span class="token operator">=</span><span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">allOf</span><span class="token punctuation">(</span>task1<span class="token punctuation">,</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span>task6<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">try</span> <span class="token punctuation">{</span>
    headerFuture<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Exception</span> ex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
  <span class="token punctuation">}</span>
<span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;all done. &quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,80);function I(M,R){const s=c("font");return l(),i("div",null,[r,n("ol",null,[d,k,n("li",null,[a("LockSupport.park() LockSupport.unpark() "),n("ul",null,[m,g,n("li",null,[e(s,{color:"orchid"},{default:t(()=>[a("许可证最多只能发放一个，多次发放不会累积许可证")]),_:1})])])])]),h,v,b,n("p",null,[a("对于 Java 来说，你可以把 JMM 看作是 Java 定义的并发编程相关的一组规范，除了抽象了线程和主内存之间的关系之外，其还"),e(s,{color:"orchid"},{default:t(()=>[a("规定了从 Java 源代码到 CPU 可执行指令的这个转化过程要遵守哪些和并发相关的原则和规范")]),_:1}),a("。")]),y,n("ul",null,[f,n("li",null,[n("p",null,[_,a("（Monitor Lock Rule） ："),e(s,{color:"orchid"},{default:t(()=>[a("解锁 先行发生于加锁；就是说要想加锁，必须是无锁状态。")]),_:1})])]),n("li",null,[n("p",null,[A,a("（Volatile Variable Rule） ：对一个 volatile 变量的写操作 先行发生 于后面对这个 volatile 变量的读操作。说白了就是对 "),e(s,{color:"orchid"},{default:t(()=>[a("volatile 变量的写操作的结果对于发生于其后的任何操作都是可见的")]),_:1}),a("。")])]),C]),z,n("p",null,[S,a("：当线程 A 访问代码块并获取锁对象时，会在 java 对象头和栈帧中记录偏向的锁的 "),x,a("，因为偏向锁不会主动释放锁，因此以后线程 A 再次获取锁的时候，需要比较当前线程的 "),w,a(" 和 Java 对象头中的"),e(s,{color:"orchid"},{default:t(()=>[j,a(" 是否一致")]),_:1})]),n("ul",null,[L,n("li",null,[n("p",null,[a("如果不一致（其他线程，如线程 B 要竞争锁对象，而偏向锁不会主动释放因此还是存储的线程 A 的 "),T,a(" ），那么需要查看 Java 对象头中记录的"),e(s,{color:"orchid"},{default:t(()=>[a("线程 A 是否存活")]),_:1})]),n("ul",null,[F,n("li",null,[n("p",null,[a("如果存活，那么立刻查找该线程（线程 A ）的栈帧信息，"),e(s,{color:"orchid"},{default:t(()=>[a("是否需要继续持有")]),_:1})]),q])])])]),J])}const O=p(u,[["render",I],["__file","index.html.vue"]]),P=JSON.parse('{"path":"/concurrent/","title":"并发导航栏","lang":"zh-CN","frontmatter":{"description":"并发导航栏 中断机制之协商中断 volatile实现中断 AtomicBoolean实现中断 Thread自带中断API interrupt：设置中断状态位为true，表示请求中断 isInterrupted：取出中断状态位布尔值，判断是否中断 Thread.interrupted：取出设置的中断状态位布尔值，取出后，清除状态位为false，静态方法 ...","head":[["meta",{"property":"og:url","content":"https://vuepress-theme-hope-docs-demo.netlify.app/concurrent/"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"并发导航栏"}],["meta",{"property":"og:description","content":"并发导航栏 中断机制之协商中断 volatile实现中断 AtomicBoolean实现中断 Thread自带中断API interrupt：设置中断状态位为true，表示请求中断 isInterrupted：取出中断状态位布尔值，判断是否中断 Thread.interrupted：取出设置的中断状态位布尔值，取出后，清除状态位为false，静态方法 ..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"http://images.xyzzs.top/image/image-20230204152749811.png_char"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T15:46:57.000Z"}],["meta",{"property":"article:author","content":"Mr.Hope"}],["meta",{"property":"article:modified_time","content":"2024-04-24T15:46:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"并发导航栏\\",\\"image\\":[\\"http://images.xyzzs.top/image/image-20230204152749811.png_char\\",\\"http://images.xyzzs.top/image/1671712156967-d3e28480-bdf5-4bda-a657-beb5301e6698.png_char_char\\",\\"http://images.xyzzs.top/image/image-20230204174406473.png_char\\",\\"http://images.xyzzs.top/image/image-20230204183818078.png_char\\",\\"http://images.xyzzs.top/image/image-20230204190149853.png_char\\",\\"http://images.xyzzs.top/image/image-20230204190236265.png_char\\"],\\"dateModified\\":\\"2024-04-24T15:46:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Mr.Hope\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"中断机制之协商中断","slug":"中断机制之协商中断","link":"#中断机制之协商中断","children":[]},{"level":2,"title":"等待通知机制","slug":"等待通知机制","link":"#等待通知机制","children":[]},{"level":2,"title":"JMM","slug":"jmm","link":"#jmm","children":[]},{"level":2,"title":"volatile关键字","slug":"volatile关键字","link":"#volatile关键字","children":[]},{"level":2,"title":"synchronized 关键字","slug":"synchronized-关键字","link":"#synchronized-关键字","children":[]},{"level":2,"title":"CAS","slug":"cas","link":"#cas","children":[]},{"level":2,"title":"原子操作类","slug":"原子操作类","link":"#原子操作类","children":[]},{"level":2,"title":"ThreadLocal（线程局部变量）","slug":"threadlocal-线程局部变量","link":"#threadlocal-线程局部变量","children":[]},{"level":2,"title":"AQS","slug":"aqs","link":"#aqs","children":[]},{"level":2,"title":"Semaphore","slug":"semaphore","link":"#semaphore","children":[]},{"level":2,"title":"CompletableFuture","slug":"completablefuture","link":"#completablefuture","children":[{"level":3,"title":"创建","slug":"创建","link":"#创建","children":[]},{"level":3,"title":"处理异步结算的结果","slug":"处理异步结算的结果","link":"#处理异步结算的结果","children":[]},{"level":3,"title":"异常处理","slug":"异常处理","link":"#异常处理","children":[]},{"level":3,"title":"组合 CompletableFuture","slug":"组合-completablefuture","link":"#组合-completablefuture","children":[]},{"level":3,"title":"并行运行多个 CompletableFuture","slug":"并行运行多个-completablefuture","link":"#并行运行多个-completablefuture","children":[]}]}],"git":{"createdTime":1713973617000,"updatedTime":1713973617000,"contributors":[{"name":"jossezs","email":"zzss5224@163.com","commits":1}]},"readingTime":{"minutes":19.13,"words":5739},"filePathRelative":"concurrent/README.md","localizedDate":"2024年4月24日","autoDesc":true}');export{O as comp,P as data};
