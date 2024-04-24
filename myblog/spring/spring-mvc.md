# Spring MVC 导航栏

\1) 用户向服务器发送请求，请求被SpringMVC 前端控制器 DispatcherServlet捕获。
\2) DispatcherServlet对请求URL进行解析，得到请求资源标识符（URI），判断请求URI对应的映射：
a) 不存在
i. 再判断是否配置了mvc:default-servlet-handler
ii. 如果没配置，则控制台报映射查找不到，客户端展示404错误
iii. 如果有配置，则访问目标资源（一般为静态资源，如：JS,CSS,HTML），找不到客户端也会展示404错误 
 b) 存在则执行下面的流程 


\3) 根据该URI，调用HandlerMapping获得该Handler配置的所有相关的对象（包括Handler对象以及
Handler对象对应的拦截器），最后以HandlerExecutionChain执行链对象的形式返回。
\4) DispatcherServlet 根据获得的Handler，选择一个合适的HandlerAdapter。
\5) 如果成功获得HandlerAdapter，此时将开始执行拦截器的preHandler(…)方法【正向】
\6) 提取Request中的模型数据，填充Handler入参，开始执行Handler（Controller)方法，处理请求。
在填充Handler的入参过程中，根据你的配置，Spring将帮你做一些额外的工作：
a) HttpMessageConveter： 将请求消息（如Json、xml等数据）转换成一个对象，将对象转换为指定
的响应信息
b) 数据转换：对请求消息进行数据转换。如String转换成Integer、Double等
c) 数据格式化：对请求消息进行数据格式化。 如将字符串转换成格式化数字或格式化日期等
d) 数据验证： 验证数据的有效性（长度、格式等），验证结果存储到BindingResult或Error中
\7) Handler执行完成后，向DispatcherServlet 返回一个ModelAndView对象。
\8) 此时将开始执行拦截器的postHandle(...)方法【逆向】。
\9) 根据返回的ModelAndView（此时会判断是否存在异常：如果存在异常，则执行
HandlerExceptionResolver进行异常处理）选择一个适合的ViewResolver进行视图解析，根据Model
和View，来渲染视图。
\10) 渲染视图完毕执行拦截器的afterCompletion(…)方法【逆向】。
\11) 将渲染结果返回给客户端。 




![img](https://cdn.nlark.com/yuque/0/2022/png/25864774/1666182848168-a3174f94-dec0-464d-aed9-9c7c6612117f.png)