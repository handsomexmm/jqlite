function Base(selector){	//构造函数获取所有的dom节点，引入下面通过原型链绑定的query方法来实现；
	this.elements=[];		
	if(typeof(selector)=='object'){		
		this.elements[0]=selector;    //当用户传入多个参数时，默认只获取第一个参数对应的dom元素
	}else{ 		
		this.query(selector); 
	}	
}
//封装方法获取 elements
Base.prototype.query=function(selector){	//用原型链的方式给构造函数绑定一个qurey的方法来实现获取dom节点的功能；
	this.elements=document.querySelectorAll(selector);	
}
function $(selector){			//封装$方法，方法里面反回一个实例化构造函数的方法，new Base（）；
	return new Base(selector);
}
/*
jqLite的实例
 */
$.ajax=function(json){		//ajax请求数据的方法
	//创建xhr对象
	function createXHR(){
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest(); //支持IE7+，非IE
		}
		return new ActiveXObject("Microsoft.XMLHTTP"); //支持IE6
	}
	//格式化数据
	function formatJson(data){
		var str='';
		for(var attr in data){			
			str+=attr+'='+data[attr]+'&'			
		}	
		return str.slice(0,-1);		
	}		
	var type=json.type?json.type:'get';	
	var async=json.async?json.async:true;	
	var data=formatJson(json.data);  /*把对象转换成  url数据*/	
	if(!json.url){		
		json.error('传入参数错误，必须传入url')
		return false;		
	}
	//1.创建XMLHttpRequest
	var xhr= createXHR();			
	if(type.toLowerCase()=='get'){		
		if(json.url.indexOf('?')!=-1){
			var api=json.url+'&'+data;			
		}else{
			var api=json.url+'?'+data;
		}				
		xhr.open(type,api,async);
		xhr.send(); 		
	}else{  /*post*/								
		xhr.open(type,json.url,async);		
		//设置请求头		
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");		
		xhr.send(data);   // name=张三&age=20				
	}	
	if(async){ /*异步*/		
		xhr.onreadystatechange=function(){			
			if(xhr.readyState==4&&xhr.status==200){				
				var result=JSON.parse(xhr.responseText);			
				json.success(result);				
			}			
		}				
	}else{ //同步				
		if(xhr.status==200){			
			//调用成功的回调函数			
			var result=JSON.parse(xhr.responseText);			
			json.success(result);			
		}
	}
}

$.get=function(api,success,err){	//获取ajax数据的方法
	$.ajax({						
		type:'get',			
		url:api,		
		success:function(data){
			success(data)
		},
		error:function(errdata){				
			err(errdata);
		}
	})
}


//封装一个find方法，找到当前节点下面的子节点
Base.prototype.find=function(el){
	var allChildElements=[];	/*放所有找到的子元素*/
	for(var i=0;i<this.elements.length;i++){		
		var childElements=this.elements[i].querySelectorAll(el);	  /*获取每个满足条件dom下面的子节点*/	
		for(var j=0;j<childElements.length;j++){
			allChildElements.push(childElements[j]);			
		}
	}		
	this.elements=allChildElements;  /*改变dom节点的指向，让其就指向被找到的子元素*/
	return this;		//返回当前实例化后的对象，以便连缀操作$('dom').css().find();
}

/*
 获取和设置css
 */
Base.prototype.css=function(attr,value){	
	if(typeof(attr)=='object'){//当attr为一个对象时就表明attr中包括了多个css属性以json对象键值对{attr：value}的形式传入					
			for(var i=0;i<this.elements.length;i++){
				for(key in attr){
					this.elements[i].style[key]=attr[key];	
				}	
			}
	}else{	
		if(arguments.length==1){	//当arguments的长度为1时，就表示只传入了attr这个参数，此时就表示获取css属性值
			return getMyComputedStyle(this.elements[0],attr);			
		}else{			
			for(var i=0;i<this.elements.length;i++){				
				this.elements[i].style[attr]=value;			
			}
		}
	}	
	//返回当前实例，可以让我们连缀操作
	return this;
}
Base.prototype.html=function(value){	//设置和获取innerHTML的方法
	if(arguments.length==0){		//当	arguments为0时就表示获取元素的innerhtml	
		return this.elements[0].innerHTML;		
	}else{		
		for(var i=0;i<this.elements.length;i++){				
			this.elements[i].innerHTML=value;
		}
	}	
}
Base.prototype.click=function(cb){		//封装点击的事件，cb为回调函数，回调函数里面再执行原型链上的其它方法，来操作dom元素
	for(var i=0;i<this.elements.length;i++){				
		this.elements[i].onclick=cb;
	}
}

Base.prototype.hover=function(cb1,cb2){		//封装一个hover的方法
	for(var i=0;i<this.elements.length;i++){				
		this.elements[i].onmouseover=cb1;		
		this.elements[i].onmouseleave=cb2;		
	}
}

Base.prototype.first=function(){	//first获取满足条件的第一个节点
//	改变elements的时候一定要保证this.elements 是个数组		
	var firstElements=[];	
	firstElements.push(this.elements[0]);	
	this.elements=firstElements;	
	return this;
}
//last  获取满足条件的最后一个节点
Base.prototype.last=function(){
		
//	改变elements的时候一定要保证this.elements 是个数组		
	var lastElements=[];	
	lastElements.push(this.elements[this.elements.length-1]);	
	this.elements=lastElements;
	return this;
}
Base.prototype.eq=function(index){	//eq获取满足条件索引值的节点 
	var eqElements=[];		
	eqElements.push(this.elements[index]);   /*获取满足索引值的dom节点*/	
	this.elements=eqElements;
	return this;
}

Base.prototype.getChild=function(index){		//get方法获取dom数组集合里面的第几个dom节点
	return this.elements[index]; 	
}

Base.prototype.index=function(){	
	//获取父节点下面的所有子节点	
	//调用$(this) 表示把当前的dom节点给this.elements[0]  	
	var childElements=this.elements[0].parentNode.children;	
	for(var i=0;i<childElements.length;i++){	
		if(this.elements[0]==childElements[i]){			
			return i;
		}		
	}	
	return -1;		
}
Base.prototype.show=function(){		//封装让元素显示的方法
	for(var i=0;i<this.elements.length;i++){		
		this.elements[i].style.display='block';		
	}
	return this;
}

Base.prototype.hide=function(){		//封装让元素隐藏的方法
	for(var i=0;i<this.elements.length;i++){		
		this.elements[i].style.display='none';		
	}
	return this;
}

Base.prototype.scrollTop=function(position){	//获取和设置滚动条高度的方法
	if(this.elements[0]==document){	//判断是不是document滚动事件
		if(arguments.length==1){		//当arguments接收了一个参数的时候表示设置滚动条的高度为多少
			document.documentElement.scrollTop=position;
			document.body.scrollTop=position;
		}else{		//当没有参数传入时表示获取滚动条的高度
			return document.documentElement.scrollTop||document.body.scrollTop;
		}
	}else{		//这里指不是document的滚动事件
		if(arguments.length==1){
			this.elements[0].scrollTop=position;
		}else{
			return this.elements[0].scrollTop;
		}
	}
}
Base.prototype.scroll=function(cb){		//监听滚动条滚动事件的方法
	for(var i=0;i<this.elements.length;i++){		
		this.elements[i].onscroll=cb;		
	}
}

Base.prototype.hasClass=function(attr1,attr2){ 	  											
	if(arguments.length==1){	//如果传入1个参数  element就是当前的className			
		var className=attr1;
		var reg=new RegExp('(\\s+|^)'+className+'(\\s+|$)');  //这样写才可以字符串拼接			
		return reg.test(this.elements[0].className);					
	}else if(arguments.length==2){		//如果传入2个参数 第一个参数是DOM节点，第二个参数：className	
		var element=attr1;		
		var className=attr2;		
		var reg=new RegExp('(\\s+|^)'+className+'(\\s+|$)');  //这样写才可以字符串拼接			
		return reg.test(element.className);			
	}
}

Base.prototype.addClass=function(className){	
	//判断是否存在
	for(var i=0;i<this.elements.length;i++){		
		if(!this.hasClass(this.elements[i],className)){
			/* 	var  box=document.getElementById('box');
				box.className=box.className+' active';
			 */
			this.elements[i].className=this.elements[i].className+' '+className;
		}
	}
}
//移除Class
Base.prototype.removeClass=function(className){	
	//判断是否存在
	for(var i=0;i<this.elements.length;i++){		
		if(this.hasClass(this.elements[i],className)){		
//			this.elements[i].className     box actvie pox 			
			var reg=new RegExp('(\\s+|^)'+className+'(\\s+|$)');			
			//替换存在的className，重新赋值给dom节点
			this.elements[i].className=this.elements[i].className.replace(reg,' ');				
		}
	}
}

Base.prototype.center=function(){	//封装一个任意元素居中的方法	
	this.css({		
		"position":"absolute",
		"top":'50%',
		"left":"50%",
		"transform":"translate(-50%,-50%)",
		'zIndex':1000
	})	
	return this;
}

Base.prototype.showMask=function(){		//显示遮罩层的方法
		var oDiv=document.createElement('div');		
		oDiv.setAttribute('id','mask')		
		oDiv.style.position='absolute';			
		oDiv.style.top='0';		
		oDiv.style.left='0';		
		oDiv.style.width='100%';		
		oDiv.style.height='100%';
		oDiv.style.zIndex=100;		
		oDiv.style.background="rgba(0,0,0,0.5)";		
		document.body.appendChild(oDiv);	
		document.body.style.overflow="hidden";
}

Base.prototype.hideMask=function(){		//隐藏遮罩层的方法
		var oDiv=document.getElementById('mask');				
		document.body.removeChild(oDiv);	
		document.body.style.overflowY="auto";
}

Base.prototype.siblings=function(element){	//获取兄弟节点的方法
	var siblingsElements=[];	//定义一个数组来存放获取到的兄弟节点
	if(arguments.length==1){  //判断如果传入一个参数，则表示只获取跟这个元素一样的兄弟节点，而不一样的兄弟节点则不获取
		var childElements=this.elements[0].parentNode.querySelectorAll(element);		
	}else{			//如果不传参，则表示获取跟这个元素同级的所有兄弟节点
		var childElements=this.elements[0].parentNode.children;
	}
	for(var j=0;j<childElements.length;j++){			
		if(this.elements[0]!=childElements[j]){//判断如果兄弟节点不是当前对象则表示是该元素的兄弟节点，把其放入到上面的数组中
			siblingsElements.push(childElements[j])
		}
	}	
	this.elements=siblingsElements;	
	return this;	
}

Base.prototype.drag=function(el){ //定义任意元素拖拽的方法，传入参数则表示拖动指定的元素并让父元素移动
	if(arguments.length==1){		
		for(var i=0;i<this.elements.length;i++){				 
			this.elements[i].querySelector(el).onmousedown=function(e){			
				var _that=this;   
				var e=e||event;			
				var offsetX=e.offsetX;
				var offsetY=e.offsetY;						
				document.onmousemove=function(e){
					preDefault(e);  /*阻止默认行为*/			
					stopPropagation(e);  /*阻止冒泡*/			
					var e=e||event;								
					var clientX=e.clientX;				
					var clientY=e.clientY;				
					var left=clientX-offsetX;				
					var top=clientY-offsetY;				
					_that.parentNode.style.left=left+'px';				
					_that.parentNode.style.top=top+'px';
					_that.parentNode.style.margin="0px";				
					_that.parentNode.style.padding="0px"				
					_that.parentNode.style.transform="translate(0,0)";					
				}				
				document.onmouseup=function(e){					
					document.onmousemove=null;				
					document.onmouseup=null;
				}				
			}		
		}		
	}else{				
		for(var i=0;i<this.elements.length;i++){					
			this.elements[i].onmousedown=function(e){			
				var _that=this;   /*this.elements[i]*/
				var e=e||event;			
				var offsetX=e.offsetX;
				var offsetY=e.offsetY;						
				document.onmousemove=function(e){
					preDefault(e);  /*阻止默认行为*/			
					stopPropagation(e);  /*阻止冒泡*/			
					var e=e||event;								
					var clientX=e.clientX;				
					var clientY=e.clientY;				
					var left=clientX-offsetX;				
					var top=clientY-offsetY;				
					_that.style.left=left+'px';				
					_that.style.top=top+'px';
					_that.style.margin="0px";				
					_that.style.padding="0px"	//改变center()方法里面的属性,使其不影响拖拽			
					_that.style.transform="translate(0,0)";					
				}				
				document.onmouseup=function(e){					
					document.onmousemove=null;				
					document.onmouseup=null;
				}				
			}		
		}
	}
}

Base.prototype.animate=function(json,time,fn){	//运动的方法，缓冲运动多属性及链式运动
	time=time||30;		
	var _that=this; //保存当前对象
	for(var i=0;i<this.elements.length;i++){
		clearInterval(_that.elements[i].timer);				
		(function(i){					
			_that.elements[i].timer = setInterval(function(){					
				var bStop = true; //表示全部到达目标值							
				//遍历json对象中的每个css样式属性键值对
				for (var attr in json) {
					var iTarget = json[attr]; 				
					//1, current
					var current;
					if (attr == "opacity") { //透明度 
						current = Math.round(getMyComputedStyle(_that.elements[i],attr) * 100); 
					}
					else { //left,top,width,height
						current = parseFloat(getMyComputedStyle(_that.elements[i], attr)); 
						current = Math.round(current);
					}								
					//2, speed
					var speed = (iTarget-current) / 8;
					speed = speed>0 ? Math.ceil(speed) : Math.floor(speed); 								
					//3, 判断临界值
					if (current != iTarget){
						bStop = false; //说明有至少一个样式属性没有到达目标值
					}							
					//4, 运动
					if (attr == "opacity") {
						_that.elements[i].style[attr] = (current + speed) / 100;
						_that.elements[i].style.filter = "alpha(opacity="+ (current+speed) +")";
					}
					else {
						_that.elements[i].style[attr] = current + speed + "px";
					}								
				}							
				//如果bStop=true， 则说明所有样式属性都到达了目标值
				if (bStop) {
					clearInterval(_that.elements[i].timer); //停止运动了													
					//回调
					if (fn) {
						fn();
					}			
				}									
			}, time);
		})(i)
	}				
	return this;
}

Base.prototype.attr=function(attr,value){	//获取和设置属性
	if(arguments.length==1){		//当argument的长度为1时表示获取属性
		return this.elements[0].getAttribute(attr);		
	}else{		//当有俩个参数时表示设置属性
		for(var i=0;i<this.elements.length;i++){		
			this.elements[i].setAttribute(attr,value)			
		}		
	}
}

Base.prototype.value=function(value){	//用于表单设置和获取其value值
	if(arguments.length==1){		
		for(var i=0;i<this.elements.length;i++){		
			this.elements[i].value=value;			
		}	
	}else{			
		return this.elements[0].value;		
	}
}
