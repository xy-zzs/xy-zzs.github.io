import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "案例",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文档",
      icon: "book",
      prefix: "guide/",
      children: "structure",
    },
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://plugin-md-enhance.vuejs.press/zh/guide/content/revealjs/demo.html",
    },
	
	//
	
	//一级目录
	{
	  text: '计算机基础2',
	  icon: "laptop-code",
	  prefix: "computer-basic",
	  collapsible: true,
	  children: "structure",
	  
		// {
		//   text: "计算机组成原理",
		//   collapsible: true,
		//   children: ["/computer-basic/computer-organization.md"],
		// },
		// {
		//   text: "操作系统",
		//   collapsible: true,
		//   children: ["/computer-basic/os.md"],
		// },
		
	  
	},

	//一级目录
	{
	  text: 'Java 基础',
	  collapsible: true,
	  children: [
		{
		  text: "Base",
		  collapsible: true,
		  children: ["/java/base.md"],
		},
		{
		  text: "Unsafe",
		  collapsible: true,
		  children: ["/java/unsafe.md"],
		},
		{
		  text: "集合",
		  collapsible: true,
		  children: ["/java/collection.md"],
		},
		{
		  text: "io",
		  collapsible: true,
		  children: ["/java/io.md"],
		},
		{
		  text: "反射",
		  collapsible: true,
		  children: ["/java/reflect.md"],
		},
	  ],
	},

	//一级目录
	{
	  text: '并发',
	  collapsible: true,
	  children: ["/concurrent/"],
	},

	//一级目录
	{
	  text: 'JVM',
	  collapsible: true,
	  children: [
		{
		  text: "内存区域与垃圾回收",
		  collapsible: true,
		  children: ["/jvm/memory-garbage-recycle.md"],
		},
		// {
		//   text: "字节码文件",
		//   collapsible: true,
		//   children: ["/jvm/class-file-structure.md"],
		// },
		{
		  text: "监控及调优",
		  collapsible: true,
		  children: ["/jvm/monitoring-and-troubleshooting-tools.md"],
		}
	  ],
	},


	//一级目录
	{
	  text: 'Spring',
	  collapsible: true,
	  children: [
		{
		  text: "Spring Framework",
		  collapsible: true,
		  children: ["/spring/spring-framework.md"],
		},
		{
		  text: "Spring Boot",
		  collapsible: true,
		  children: ["/spring/spring-boot.md"],
		},
		// {
		//   text: "Spring Cloud",
		//   collapsible: true,
		//   children: ["/spring/spring-cloud.md"],
		// },
		// {
		//   text: "Spring MVC",
		//   collapsible: true,
		//   children: ["/spring/spring-mvc.md"],
		// }
	  ],
	},

	//一级目录
	{
	  text: 'MySQL',
	  collapsible: true,
	  children: ["/mysql/"],
	},

	//一级目录
	{
	  text: 'Redis',
	  collapsible: true,
	  children: ["/redis/"],
	},

	//一级目录
	{
	  text: 'Message Queue',
	  collapsible: true,
	  children: [
		{
		  text: "MQ通用",
		  collapsible: true,
		  children: ["/message-queue/"],
		},
		{
		  text: "Kafka",
		  collapsible: true,
		  children: ["/message-queue/kafka.md"],
		},
	  ],
	},

	//一级目录
	{
	  text: '系统设计',
	  collapsible: true,
	  children: [
		{
		  text: "架构及规范",
		  collapsible: true,
		  children: ["/system-design/standard.md"],
		},
		{
		  text: "分布式",
		  collapsible: true,
		  children: ["/system-design/distributed.md"],
		},
		{
		  text: "设计模式",
		  collapsible: true,
		  children: ["/system-design/design-mode.md"],
		},
		{
		  text: "Dubbo",
		  collapsible: true,
		  children: ["/system-design/dubbo.md"],
		},
		// {
		//   text: "Netty",
		//   collapsible: true,
		//   children: ["/system-design/netty.md"],
		// },
		{
		  text: "DevOps",
		  collapsible: true,
		  children: [
			{
			  text: "Linux",
			  collapsible: true,
			  children: ["/system-design/devops/linux.md"],
			},
			{
			  text: "shell编程",
			  collapsible: true,
			  children: ["/system-design/devops/shell.md"],
			},
			// {
			//   text: "docker",
			//   collapsible: true,
			//   children: ["/system-design/devops/docker.md"],
			// },
			// {
			//   text: "k8s",
			//   collapsible: true,
			//   children: ["/system-design/devops/kubernetes.md"],
			// },
		  ],
		},
	  ],
	},
  ],
});
