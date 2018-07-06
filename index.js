#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require("os");
const program = require('commander');
const exec = require('child_process').exec;
const dateFormat = require('dateformat');

const FILE_HOME = 'C:\\Dados\\unicorp\\unilims\\sql\\todososservidores\\unilims'
const FILE_HOME_MAIN = 'C:\\projetos\\uni-helper\\tests\\main.sql'

function getName(){
    return new Promise((resolve, reject) => {
        exec('git config user.name', {}, (err, name) => {
            if(err) reject(err);
            resolve(name.trim());
        })
    })    
}

function errorHandler(err) {
    if (err) throw err;
}

async function createIssueFiles(issue){
    try{
        const name = await getName();
        const time = dateFormat(new Date(), "dd/mm/yyyy");
        const issuePath = path.resolve(FILE_HOME, `${issue}.sql`);
        fs.writeFile(issuePath, '', errorHandler);
        fs.appendFile(FILE_HOME_MAIN, `${os.EOL}${issuePath} -- ${name} ${time} - ${issue}${os.EOL}/`, errorHandler)
        console.log(`Arquivo ${issue}.sql criado!!!`);
    }catch(err){
        console.error(err);
    }
}

function openIssueFile(issue){
    const issuePath = path.resolve(FILE_HOME, `${issue}.sql`);
    exec(`start ${issuePath}`, {}, errorHandler);
}

function getModifiedFiles(){
    return new Promise((resolve, reject) => {
        exec('git status -s', {}, (err, files) => {
            if(err) reject(err)
            files = files.trim().split('\n').map(file => file.trim().split(' ')[1]);
            resolve(files);
        })
    })
}

async function insertModifiedFiles(issue){
    try{
        const issuePath = path.resolve(FILE_HOME, `${issue}.sql`);
        const modifiedFiles = await getModifiedFiles();
        modifiedFiles.forEach(file => {
            fs.appendFile(issuePath, `${file}${os.EOL}/${os.EOL}`, errorHandler)
        });
    }catch(err){
        console.error(err);
    }
}

program
  .version(require('./package.json').version);

program
    .command('open <issue>')
    .description('Abre a issue passada como parâmetro')
    .action(openIssueFile)

program
    .command('create <issue>')
    .description('Cria a issue passada como parâmetro')
    .action(createIssueFiles);

program
    .command('update <issue>')
    .description('Adiciona os arquivos modificados na issue')
    .action(insertModifiedFiles)

program.parse(process.argv);