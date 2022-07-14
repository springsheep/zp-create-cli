#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const packageData = require('./package.json')
const chalk = require('chalk')
const download = require('download-git-repo')
const program = require('commander')
const ora = require('ora')
const templates = {
  'webpack-loader': {
    url: 'https://gitee.com/sohucw/webpack-loader',
    downloadUrl: 'https://gitee.com:sohucw/webpack-loader#master',
    description: '自定义webpack loader',
  },
  'webpack-plugins': {
    url: 'https://gitee.com/sohucw/webpack-plugins',
    downloadUrl: 'https://gitee.com:sohucw/webpack-plugins#master',
    description: '自定义webpack plugins',
  },
  'template-vue2-manage': {
    url: 'https://github.com/springsheep/template-vue2-manage',
    downloadUrl: 'https://github.com:springsheep/template-vue2-manage#main',
    description: '基于 Vue.js 2.x 和 ant-design-vue 组件库且风格统一的用于快速构建中后台系统的脚手架。',
  },
}
// 设置命令
program
  .version(packageData.version)
  .option('-i, --init', '初始化项目')
  .option('-V, --version', '查看版本号信息')
  .option('-l, --list', '查看可用模版列表')
program.parse(process.argv)
console.log(
  chalk.red(
    [
      '_    _   ____     _____ ',
      '| |  | | |___    / ____|',
      '| |__| |   __) | | |     ',
      '|  __  |  |__ <  | |     ',
      '| |  | |  ___) | | |____ ',
      '|_|  |_| |____/   _____|',
      '               ',
    ].join('\n')
  )
)
// console.info(
//   '\x1B[32m%s\x1b[0m',
//   [
//     '_    _   ____     _____ ',
//     '| |  | | |___    / ____|',
//     '| |__| |   __) | | |     ',
//     '|  __  |  |__ <  | |     ',
//     '| |  | |  ___) | | |____ ',
//     '|_|  |_| |____/   _____|',
//     '               ',
//   ].join('\n')
// )
// 输入 list  查看可用模版列表
if (program.opts() && program.opts().list) {
  for (let key in templates) {
    console.log(`${key} : ${templates[key].description}`)
  }
}
// 输入init 安装我的目录
if (program.opts() && program.opts().init) {
  // 初始化项目
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称',
      },
      {
        type: 'input',
        name: 'author',
        message: '请输入作者',
      },
      {
        type: 'input',
        name: 'description',
        message: '请输入项目简介',
      },
      {
        type: 'list',
        name: 'template',
        message: '选择其中一个作为项目模版',
        choices: ['webpack-loader', 'webpack-plugins', 'template-vue2-manage'],
      },
    ])
    .then((answers) => {
      console.log('选择', answers.template.split(' ')[0])
      let url = templates[answers.template.split(' ')[0]].downloadUrl
      console.log(url)
      initTemplateDefault(answers, url)
    })
}

async function initTemplateDefault(customContent, gitUrl) {
  console.log(chalk.bold.cyan('开始创建项目'))
  const { projectName = '' } = customContent
  try {
    await checkName(projectName)
    await downloadTemplate(gitUrl, projectName)
    await changeTemplate(customContent)

    console.log(chalk.green('项目模板下载完成'))
    console.log(chalk.bold.cyan('Cli: ') + '项目创建完成✅')
  } catch (error) {
    console.log(chalk.red(error))
  }
}

// 创建项目前校验是否已存在
function checkName(projectName) {
  return new Promise((resolve, reject) => {
    fs.readdir(process.cwd(), (err, data) => {
      if (err) {
        return reject(err)
      }
      if (data.includes(projectName)) {
        return reject(new Error(`${projectName} already exists!`))
      }
      resolve()
    })
  })
}

function downloadTemplate(gitUrl, projectName) {
  const spinner = ora('download template......').start()

  return new Promise((resolve, reject) => {
    download(gitUrl, path.resolve(process.cwd(), projectName), { clone: true }, function (err) {
      if (err) {
        return reject(err)
        spinner.fail() // 下载失败提示
      }
      spinner.succeed() // 下载成功提示
      resolve()
    })
  })
}

async function changeTemplate(customContent) {
  // name description author
  const { projectName = '', description = '', author = '' } = customContent
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(process.cwd(), projectName, 'package.json'), 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      let packageContent = JSON.parse(data)
      packageContent.name = projectName
      packageContent.author = author
      packageContent.description = description
      fs.writeFile(
        path.resolve(process.cwd(), projectName, 'package.json'),
        JSON.stringify(packageContent, null, 2),
        'utf8',
        (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve()
        }
      )
    })
  })
}
