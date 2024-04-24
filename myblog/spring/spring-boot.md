#  Spring Boot 导航栏

## 自动装配原理

自动装配原理如下图

![image-20230205161215031](http://images.xyzzs.top/image/image-20230205161215031.png_char)

以下为自动配置核心源码；版本`2.3.6.RELEASE`

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan()
public @interface SpringBootApplication {}

@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {}

public class AutoConfigurationImportSelector{
    
    private final List<AutoConfigurationImportFilter> filters;
    
    protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
		if (!isEnabled(annotationMetadata)) {
			return EMPTY_ENTRY;
		}
		AnnotationAttributes attributes = getAttributes(annotationMetadata);
        //spring.factories文件读取--129个
		List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
        //用LinkedHashSet过滤条重复项
		configurations = removeDuplicates(configurations);
        //这里过滤掉指定的排除项目（exclude）
		Set<String> exclusions = getExclusions(annotationMetadata, attributes);
		checkExcludedClasses(configurations, exclusions);
		configurations.removeAll(exclusions);
        //filter()过滤,
		configurations = getConfigurationClassFilter().filter(configurations);
		fireAutoConfigurationImportEvents(configurations, exclusions);
		return new AutoConfigurationEntry(configurations, exclusions);
	}
}
```

![](http://images.xyzzs.top/image/image-20230205154007547.png_char_char_char)

<img src="http://images.xyzzs.top/image/image-20230205153523587.png_char" alt="image-20230205153523587"  />

继续跟到`filter()`做了什么

```java
List<String> filter(List<String> configurations) {
    long startTime = System.nanoTime();
    String[] candidates = StringUtils.toStringArray(configurations);
    boolean skipped = false;
    for (AutoConfigurationImportFilter filter : this.filters) {		//filters包含OnClassnCondition等
        //这里会调用AutoConfigurationImportFilter实现类执行过滤逻辑，结果保存boolean[]
        boolean[] match = filter.match(candidates, this.autoConfigurationMetadata);
        for (int i = 0; i < match.length; i++) {
            //若为false，表示要移除，将对应位置引用设null
            if (!match[i]) {
                candidates[i] = null;
                skipped = true;
            }
        }
    }
    if (!skipped) {
        return configurations;
    }
    //以下就是封装过滤结果和日志输出
    List<String> result = new ArrayList<>(candidates.length);
    for (String candidate : candidates) {
        if (candidate != null) {
            result.add(candidate);
        }
    }
    if (logger.isTraceEnabled()) {
        int numberFiltered = configurations.size() - result.size();
        logger.trace("Filtered " + numberFiltered + " auto configuration class in "
                     + TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTime) + " ms");
    }
    return result;
}
```

![image-20230205152857699](http://images.xyzzs.top/image/image-20230205152857699.png_char)

![image-20230205154550788](http://images.xyzzs.top/image/image-20230205154550788.png_char)

此时已经拿到了过滤后的结果，后面只是对该结果的封装返回。



## 实现自动装配

1. 新建Maven项目`spring-boot-starter-hello`，在`pom.xml`下加基础库：

   ```xml
   <dependencies>
       <dependency>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-autoconfigure</artifactId>
           <version>2.1.7.RELEASE</version>
       </dependency>
   </dependencies>
   ```

2. 新建属性配置类

   ```java
   public class HelloService {
       private String msg;
   
       public String getMsg() {
           return msg;
       }
   
       public void setMsg(String msg) {
           this.msg = msg;
       }
   
       public String sayHello() {
           return "hello" + msg;
       }
   }
   
   @ConfigurationProperties(prefix = "hello")
   public class HelloServiceProperties {
       private static final String MSG = "world";
       private String msg = MSG;
   
       public String getMsg() {
           return msg;
       }
   
       public void setMsg(String msg) {
           this.msg = msg;
       }
   }
   ```

3. 自动配置类

   ```java
   
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
   import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
   import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
   import org.springframework.boot.context.properties.EnableConfigurationProperties;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   
   @Configuration
   @EnableConfigurationProperties(HelloServiceProperties.class)//1
   @ConditionalOnClass(HelloService.class)//2
   @ConditionalOnProperty(prefix="hello", value = "enabled", matchIfMissing = true)//3
   public class HelloAutoConfiguration {
   
       @Autowired
       private HelloServiceProperties helloServiceProperties;
   
       @Bean
       @ConditionalOnMissingBean(HelloService.class) //4
       public HelloService helloService() {
           HelloService helloService = new HelloService();
           helloService.setMsg(helloServiceProperties.getMsg());
           return helloService;
       }
   }
   ```

   - @EnableConfigurationProperties 注解开启属性注入，将带有@ConfigurationProperties 注解的类注入为Spring 容器的 Bean。
   - 当 HelloService 在类路径的条件下。
   - 当设置 hello=enabled 的情况下，如果没有设置则默认为 true，即条件符合。
   - 当容器没有这个 Bean 的时候

4. 注册配置

   在 `src/main/resources` 下新建 `META-INF/spring.factories`。添加以下内容：

   ```properties
   org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
   com.tyson.config.HelloServiceAutoConfiguration
   ```

5. 使用starter

   在 Spring Boot 项目的 pom.xml 中添加：

   ```xml
   <dependency>
       <groupId>zzs.official</groupId>
       <artifactId>spring-boot-starter-hello</artifactId>
       <version>0.0.1-SNAPSHOT</version>
   </dependency>
   ```