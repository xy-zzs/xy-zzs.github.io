import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as t,c as p,f as r}from"./app-PDj9KKPF.js";const s={},a=r('<h1 id="性能指标" tabindex="-1"><a class="header-anchor" href="#性能指标"><span>性能指标</span></a></h1><p>5h/300w == 166.6，测出来的平均180-200</p><p>估算单机最大QPS</p><p>https://jishuin.proginn.com/p/763bfbd63e09</p><p>分布式链路追踪技术对比</p><p>https://blog.csdn.net/u012394095/article/details/79700200</p><h2 id="qps" tabindex="-1"><a class="header-anchor" href="#qps"><span>QPS</span></a></h2><p>Queries Per Second 意思是“每秒查询率”，指单位时间内查询或访问服务器的次数。</p><p>一台服务器每秒能够相应的查询次数，是对一个特定的查询服务器在规定时间内所处理流量多少的衡量标准。</p><h2 id="tps" tabindex="-1"><a class="header-anchor" href="#tps"><span>TPS</span></a></h2><p>Transactions Per Second 的缩写，也就是事务数/秒，指单位时间（每秒）系统处理的事务数。</p><p>它是软件测试结果的测量单位。事务量可以是单个接口（一个操作），也可以是多个接口（多个操作），例如点击新增按钮是单个接口，单个事务，点击新增，输入信息，点击提交这一整个流程是多个接口，多个事务。</p><p>TPS和QTP的区别</p><p>QPS是1s查询服务器的次数，TPS是1s处理的事务量，一个事务量里可以包含多次查询。当多次查询或访问服务器时，一个TPS相当于多个QPS；当只查询或访问一次时，一个TPS则等价于一个QPS。</p><h2 id="rt-响应时间" tabindex="-1"><a class="header-anchor" href="#rt-响应时间"><span>RT 响应时间</span></a></h2><p>响应时间RT(Response-time)：执行一个请求从开始到最后收到响应数据所花费的总体时间,即从客户端发起请求到收到服务器响应结果的时间。</p><p>这是一个系统最重要的指标之一，它的数值大小直接反应了系统的快慢。</p><h2 id="并发数" tabindex="-1"><a class="header-anchor" href="#并发数"><span>并发数</span></a></h2><p>客户端并发，也就是jmeter线程数；跑道里参加赛跑的人数（这里的并发是广义的并发，即同一个时间段内对系统发起的请求数量）。并发数是指系统同时能处理的请求数量，这个也是反应了系统的负载能力。</p><h2 id="吞吐量" tabindex="-1"><a class="header-anchor" href="#吞吐量"><span>吞吐量</span></a></h2><p>吞吐量是指系统处理客户请求数量的总和。</p><p>吞吐率是单位时间内的吞吐量。可以从多个维度衡量吞吐率：①业务角度：单位时间（每秒）的请求数或页面数，即请求数/秒或页面数/秒；②网络角度：单位时间（每秒）网络中传输的数据包大小，即字节数/秒等；③系统角度，单位时间内服务器所承受的压力，即系统的负载能力。</p><p>系统的吞吐量（承压能力）与request对CPU的消耗、外部接口、IO等等紧密关联。单个request 对CPU消耗越高，外部系统接口、IO速度越慢，系统吞吐能力越低，承载压力的能力越差。</p><p>与吞吐量有关的参数：QPS、TPS、并发数、响应时间。</p><p><strong>什么是高并发</strong></p><p>如果说，分布式是针对巨大流量来增添分流，平分压力，那么高并发所解决的问题上就是请求集中的问题，它所反映的是的是同时有多少量。</p><p><strong>什么是多线程</strong></p><p>多线程则更多的是解决CPU调度多个进程的问题，让这些进程看上去是同时执行（实际是交替运行的）。</p><p>高并发是从业务的角度去描述系统的能力，实现高并发的手段可以采用分布式，也可以采用诸如缓存、CDN或消息队列等，当然也包括多线程。</p>',29),n=[a];function o(i,c){return t(),p("div",null,n)}const d=e(s,[["render",o],["__file","performance.html.vue"]]),m=JSON.parse('{"path":"/system-design/performance.html","title":"性能指标","lang":"zh-CN","frontmatter":{"description":"性能指标 5h/300w == 166.6，测出来的平均180-200 估算单机最大QPS https://jishuin.proginn.com/p/763bfbd63e09 分布式链路追踪技术对比 https://blog.csdn.net/u012394095/article/details/79700200 QPS Queries Per Se...","head":[["meta",{"property":"og:url","content":"https://vuepress-theme-hope-docs-demo.netlify.app/system-design/performance.html"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"性能指标"}],["meta",{"property":"og:description","content":"性能指标 5h/300w == 166.6，测出来的平均180-200 估算单机最大QPS https://jishuin.proginn.com/p/763bfbd63e09 分布式链路追踪技术对比 https://blog.csdn.net/u012394095/article/details/79700200 QPS Queries Per Se..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T15:46:57.000Z"}],["meta",{"property":"article:author","content":"Mr.Hope"}],["meta",{"property":"article:modified_time","content":"2024-04-24T15:46:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"性能指标\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-04-24T15:46:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Mr.Hope\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"QPS","slug":"qps","link":"#qps","children":[]},{"level":2,"title":"TPS","slug":"tps","link":"#tps","children":[]},{"level":2,"title":"RT 响应时间","slug":"rt-响应时间","link":"#rt-响应时间","children":[]},{"level":2,"title":"并发数","slug":"并发数","link":"#并发数","children":[]},{"level":2,"title":"吞吐量","slug":"吞吐量","link":"#吞吐量","children":[]}],"git":{"createdTime":1713973617000,"updatedTime":1713973617000,"contributors":[{"name":"jossezs","email":"zzss5224@163.com","commits":1}]},"readingTime":{"minutes":2.87,"words":860},"filePathRelative":"system-design/performance.md","localizedDate":"2024年4月24日","autoDesc":true}');export{d as comp,m as data};
