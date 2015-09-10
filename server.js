/**
 * Created by Administrator on 2015/9/10.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

function deleteP(path){
    var paths = path.split('/');
    for(var i =paths.length;i>=1;i--){
        var loca = paths.slice(0,i).join('/');
        if(fs.existsSync(path)){
            if(fs.statSync(loca).isDirectory()){
                var files = fs.readdirSync(loca);
                console.log(files)
                files.forEach(function(files){
                    var filePath = loca+'/'+files;
                    console.log(filePath)
                    if(fs.statSync(filePath).isFile()){ //判断里面的是文件

                        fs.unlinkSync(filePath);
                    }else{
                        deleteP(filePath)
                    }
                });
                fs.rmdirSync(path); //删除空文件夹
            }else{
                fs.unlinkSync(loca)
            }
        }
    }

}

http.createServer(function(req,res){
    var url = req.url;
    var urls = url.split('?');
    var pathname = urls[0];
    var query = urls[1];
    var queryObj = {};
    if(query){
        var field = query.split('&');
        field.forEach(function(field){
            var vals = field.split('=');
            queryObj[vals[0]]=vals[1];
        })
    }

    if(pathname=='/favicon.ico'){
        res.end('忽略不计');
    }else if(pathname=='/del'){ //删除事件
        for(var key in queryObj){
            deleteP(queryObj[key]);
        }
        //res.end('This is del file')
    }else{
        var filename = '.'+pathname;
        fs.exists(filename,function(exists){ //判断文件是否存在
            if(exists){ //文件存在
                var htmlStr = '<link href="/css/index.css" rel="stylesheet" />';
                htmlStr += "<h1>This is a File</h1><ul>";
                if(fs.statSync(filename).isDirectory()){ // 判断是目录
                    fs.readdir(filename,function(err,files){
                        if(err){
                            res.end('error')
                        }else{
                            res.writeHeader(200,{'Content-Type':'text/html;charset=utf-8'})
                            files.forEach(function(file){ //遍历目录下的文件
                                if(file=='.git'||file=='node_modules'||file=='.idea'){
                                }else{
                                    var filePath = filename+'/'+file;
                                    if(pathname=='/'){//根目录
                                        if(fs.statSync(filePath).isDirectory()){
                                            htmlStr+='<li class="folder"><a href="'+file+'">查看文件夹'+file+'</a><a href=/del?path='+file+' class="del">删除</a> </li>';
                                        }else{
                                            htmlStr+='<li><a href="'+file+'">查看文件'+file+'</a><a href=/del?path='+file+' class="del">删除</a> </li>';
                                        }
                                    }else{ //根目录下一级目录
                                        if(fs.statSync(filePath).isDirectory()){
                                            htmlStr+='<li class="folder"><a href="'+pathname+'/'+file+'">查看文件夹'+file+'</a><a href=/del?path='+pathname+'/'+file+' class="del">删除</a> </li>';
                                        }else{
                                            htmlStr+='<li><a href="'+pathname+'/'+file+'">查看文件'+file+'</a><a href=/del?path='+pathname+'/'+file+' class="del">删除</a> </li>';
                                        }
                                    }
                                }
                            })
                        }

                        htmlStr+='</ul>'
                        res.end(htmlStr)
                    })
                }else if(fs.statSync(filename).isFile()){ //如果是文件
                    res.writeHeader(200,{'Content-Type':mime.lookup(filename)+';charset=utf-8'});
                    fs.readFile(filename,function(err,data){
                        res.end(data);
                    })
                }else{
                    res.writeHeader(400,{'Content-Type':'text/html;charset=utf-8'});
                    res.end('404 not found')
                }
            }
        })

    }
    //res.end('i am a test');
}).listen(910)