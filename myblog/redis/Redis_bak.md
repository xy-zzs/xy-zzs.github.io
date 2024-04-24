## 网络模型

### 阻塞IO

## ![img](http://images.xyzzs.top/image/1665392631077-5a784189-fef7-43bb-8efd-c7e0660b36af.png_char_char)

### 非阻塞IO

![img](http://images.xyzzs.top/image/1665392677678-e6e64cf3-9a87-48a4-aea9-394acf817eb6.png_char_char)

### IO多路复用

![img](http://images.xyzzs.top/image/1665398732553-a4c868a3-146d-4b6d-b83e-ac886ec3e9ea.png_char_char)

![img](http://images.xyzzs.top/image/1665399118431-59989edf-0b20-4b0f-b28a-5f45506026f4.png_char_char)

![img](http://images.xyzzs.top/image/1665399369550-dd830de3-21aa-4d89-8ac2-7f48c2bf7b8a.png_char_char)

### 信号驱动IO

![img](http://images.xyzzs.top/image/1665399512619-1e18d79c-b314-4450-a33c-de2e6f2cac58.png_char_char)

### 异步IO

![img](http://images.xyzzs.top/image/1665399537985-9fd6c1b2-9239-4133-84aa-7bc4413b8e44.png_char_char)





![img](http://images.xyzzs.top/image/1665399644968-e2c9d9d1-4ab5-43a7-bcec-9f2990be30e8.png_char_char)





## 通信协议













## 实现功能

### 短信登陆

redis共享session应用

![img](http://images.xyzzs.top/image/1664893264304-ad222aba-b0f1-4f40-9388-1dbf6113ceb7.png_char_char)





### 优惠券秒杀

全局id生成器



防止超卖

一人一单

redis计数器 Lua脚本



#### redis三种消息队列

![img](http://images.xyzzs.top/image/1665291772896-2a91d089-29e0-4a6d-b188-c80324bca77d.png_char_char)

list

![img](http://images.xyzzs.top/image/1665286334033-dd990e01-b88e-4e8b-9fd5-94e82a82e4fc.png_char_char)

PubSub

![img](http://images.xyzzs.top/image/1665286614419-7fbfb93e-525c-438f-bd2a-e3e25008de2b.png_char_char)





#### 分布式锁

![img](http://images.xyzzs.top/image/1665220323551-a8957210-42b2-4400-b3ab-494f663e4d83.png_char_char)

![img](http://images.xyzzs.top/image/1665219687206-4a65cddf-bf57-4704-8a71-9fcca664c529.png_char_char)

![img](http://images.xyzzs.top/image/1665278868780-7e1aab10-f3d5-4fa1-9276-ba1893cb88de.png_char)

![img](http://images.xyzzs.top/image/1665278919207-5d2b0dd6-67c3-4e63-80be-679ef906da7a.png_char_char)

multiLock

![img](http://images.xyzzs.top/image/1665279414160-22a819c4-b110-46d1-9efc-00b4b84ffe1d.png_char_char)





![img](http://images.xyzzs.top/image/1665280220414-1f393a9e-cdde-4215-8705-14f9dc2135b1.png_char_char)



### 达人探店-zset

ZSet

点赞列表-



点赞排行榜

![img](http://images.xyzzs.top/image/1665296998044-bb087454-38af-4a3f-a890-401a836d3501.png_char_char)



### 好友关注——list

基于set集合的

关注和取关

共同关注-Set

关注消息推送

feed流







TODO：网络模型 最佳实践

分布式锁 Redisson 



小细节：

命令不区分大小写，key值区分大小写

help @类型

help @setnx



<div style="display:none">CSNotes:https://www.cyc2018.xyz/%E6%95%B0%E6%8D%AE%E5%BA%93/Redis.html</div>

<div style="display:none">https://developers.pub/wiki/1002310/1011918</div>

<div style="display:none">https://xiaolincoding.com/redis</div>

<div style="display:none">囧辉：https://blog.csdn.net/v123411739/article/details/116109674</div>

