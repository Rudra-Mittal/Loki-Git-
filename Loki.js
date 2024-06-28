#!/usr/bin/env node
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import chalk from "chalk";
import { diffLines } from "diff";
import { Command } from "commander";
const program = new Command();
class Loki {

    constructor(repoPath = '.') {
        this.repoPath = path.join(repoPath, '.loki'); // .loki is the folder where all the loki files are stored
        this.objectsPath = path.join(this.repoPath, 'objects'); // objects folder contains all the objects
        this.headPath = path.join(this.repoPath, 'HEAD'); // HEAD file contains the reference to the current branch
        this.indexPath = path.join(this.repoPath, 'index'); // index file contains the staged files
        this.init();
    }
    hashContent(content) {
        return crypto.createHash('sha1').update(content, "utf-8").digest("hex");
    }
    async init() {
        await fs.mkdir(this.objectsPath, { recursive: true }, { flag: "wx" })
        await fs.mkdir(this.repoPath, { recursive: true }, { flag: "wx" })
        try {
            await fs.writeFile(this.headPath, "", { flag: "wx" })
            await fs.writeFile(this.indexPath, "[]", { flag: "wx" })
        } catch (e) {
            // console.log("Error in init");
            // console.log(e);
        }
    }

    async add(file) {
        const content = await fs.readFile(file, "utf-8");
        const hash = this.hashContent(content);
        console.log(hash);
        const objectPath = path.join(this.objectsPath, hash.slice(0, 2)); //create a folder with the first 2 characters of the hash
        const objectFilePath = path.join(objectPath, hash.slice(3)); // create a file with the rest of the hash
        try {
            await fs.mkdir(objectPath, { recursive: true }, { flag: "wx" });
            await fs.writeFile(objectFilePath, content, { flag: "wx" });
            await this.updateIndex(file, hash);
        } catch (e) {
            // console.log("Error in add");
            // console.log(e);
        }
    }

    async updateIndex(filePath, hash) {
        // add the file to the index
        const index = await fs.readFile(this.indexPath, "utf-8");
        const indexArray = JSON.parse(index);
        indexArray.push({ path: filePath, hash: hash });
        await fs.writeFile(this.indexPath, JSON.stringify(indexArray));
    }

    async commit(message) {
        const index = await fs.readFile(this.indexPath, "utf-8");
        const parentCommit = await this.getHead();
        const commit = {
            parent: parentCommit,
            message: message,
            time: new Date().toISOString(),
            files: index
        }
        const commitHash = this.hashContent(JSON.stringify(commit));
        const commitPath = path.join(this.objectsPath, commitHash.slice(0, 2));
        const commitFilePath = path.join(commitPath, commitHash.slice(3));
        try {
            await fs.mkdir(commitPath, { recursive: true }, { flag: "wx" });
            await fs.writeFile(commitFilePath, JSON.stringify(commit));
            await fs.writeFile(this.headPath, commitHash);
            await fs.writeFile(this.indexPath, "[]");
            console.log("Commit successful with commit Id: " + commitHash);
        } catch (e) {
            // console.log("Error in commit");
            // console.log(e);
        }

    }
    async getHead() {
        try {
            const head = await fs.readFile(this.headPath, "utf-8");
            return head || "";
        }
        catch (e) {
            console.log("Error in getHead");
            console.log(e);
        }
    }
    async printGitLog(head) {
        if (head === "") return;
        const { message, time, parent } = await this.getCommitData(head);
        console.log("Commit  :" + head);
        console.log("message :" + message + "      time :" + time);
        console.log("_____________________________\n")
        this.printGitLog(parent);
    }
    async getCommitData(commitHash) {
        const currBlobPath = path.join(this.objectsPath, commitHash.slice(0, 2), commitHash.slice(3));
        const getHeadBlob = await fs.readFile(currBlobPath, "utf-8");

        const commitData = await JSON.parse(getHeadBlob);
        // console.log(commitData);
        return commitData;
    }
    async gitLog() {
        const currHead = await fs.readFile(this.headPath, "utf-8");
        this.printGitLog(currHead);
    }

    // shows the difference between the current commit and the previous commit
    async showCommitDiff() {
        const currhead=await fs.readFile(this.headPath,"utf-8");
        const currCommitData=await this.getCommitData(currhead);
        const parentCommitData=await this.getCommitData(currCommitData.parent);
        const currFiles=JSON.parse(currCommitData.files);
        const parentFiles=JSON.parse(parentCommitData.files);
        // console.log(parentCommitData);
        // traverse through the files in the current commit
        for(const file of currFiles){
            const currFileContent=await fs.readFile(path.join(this.objectsPath,file.hash.slice(0,2),file.hash.slice(3)),"utf-8");
            // const currFileContent=JSON.parse(fileContent);
            // console.log(currFileContent);
            const parentFile=parentFiles.find((f)=>f.path===file.path);
            // console.log(parentFile);
            if(parentFile){
                console.log('\n\nChanges in file: '+file.path +'\n\n');
                    const parentFileContent=await fs.readFile(path.join(this.objectsPath,parentFile.hash.slice(0,2),parentFile.hash.slice(3)),"utf-8");
                    const diff=diffLines(parentFileContent,currFileContent);
                    
                    // console.log(diff)
                    diff.forEach((line)=>{
                        if(line.added){
                            console.log("+ "+chalk.green(line.value));
                        }else if(line.removed){
                            console.log("- "+chalk.red(line.value));
                        }else{
                            // console.log(chalk.gray(line.value));
                        }
                    })
            }else {
                console.log('\nnew file in this commit \n'+chalk.green(`+ ${file.path}`));
                
            }

    }
}
};

program.command("init").action(()=>{
    const newRepo = new Loki();
    console.log("Initialized empty Loki repository");
})

program.command("add <file>").action((file)=>{
    const newRepo = new Loki();
    newRepo.add(file);
})

program.command("commit <message>").action((message)=>{
    const newRepo = new Loki();
    newRepo.commit(message);
})

program.command("log").action(()=>{
    const newRepo = new Loki();
    newRepo.gitLog();
}
)

program.command("diff").action(()=>{
    const newRepo = new Loki();
    newRepo.showCommitDiff();
})

program.parse(process.argv);

