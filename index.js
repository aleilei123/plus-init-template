#!/usr/bin/env node
// 以上这行代码必须加，加上才可以使用 bin 下面的自定义命令

const fs = require('fs');
let path = require('path');
const program = require('commander');
const download = require('download-git-repo'); //下载模版文件
const chalk = require('chalk');  //美化终端
const symbols = require('log-symbols'); //美化终端
const handlebars = require('handlebars'); //修改模版文件内容
const ora = require('ora'); //提示下载
var inquirer = require('inquirer');  //提示文本
const package = require('./package.json'); //获取版本信息
const re = new RegExp("^[A-Za-z0-9-]+$"); //检查文件名，字母数字中划线
var myDate = new Date();

function appendZero(obj) {
    if (obj < 10) return "0" + "" + obj;
    else return obj;
}
var versionDate = (`${myDate.getFullYear()}${appendZero(myDate.getMonth()+1)}${appendZero(myDate.getDate())}`);

program
    .version(package.version, '-v,--version')
    .command('init <name>')  //规定的输入方式 ，需要 init **
    .action(name => {
        if (!re.test(name)) {
            console.log(symbols.error, chalk.red('错误!请输入dd'));
        return
    }
    if (!fs.existsSync(name)) {
        inquirer
        .prompt([])
        .then(answers => {
            console.log(symbols.success, chalk.green('开始创建..........,请稍候'));
            const spinner = ora('正在下载模板...');
            spinner.start();
            download(`direct:http://git.jd.com/h5/template-project.git`, name,{ clone: true }, err => {
                if (err) {
                    spinner.fail();
                } else {
                    spinner.succeed();
                    var root_path = process.argv[2];
                    var MyUrl = `${root_path}/${name}`;
                    function myReadfile(MyUrl) {
                        fs.readdir(MyUrl, (err, files) => {
                            if (err) throw err
                            files.forEach(file => {
                                //拼接获取绝对路径，fs.stat(绝对路径,回调函数)
                                let fPath = path.join(MyUrl, file);
                                fs.stat(fPath, (err, stat) => {
                                    //stat 状态中有两个函数一个是stat中有isFile ,isisDirectory等函数进行判断是文件还是文件夹
                                    if (stat.isFile()) {
                                        if (fPath == `${name}/src/index.html` || fPath == `${name}/webpack-user-config.js`) {                               
                                            const content = fs.readFileSync(fPath).toString();
                                            const result = handlebars.compile(content)({ projectName: name,versionDate: versionDate });
                                            fs.writeFileSync(fPath, result);
                                        } 
                                    }
                                    else {
                                        myReadfile(fPath)
                                    }
                                })
                            })
                        })
                    }
                    myReadfile(name);
                    console.log(symbols.success, chalk.green('下载完成'));
                }
            });
        });
    } else {
        console.log(symbols.error, chalk.red('有相同名称模版'));
    }
  });

program.parse(process.argv);



