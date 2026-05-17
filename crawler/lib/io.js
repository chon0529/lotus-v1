import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');

export const dataPath=(...parts)=>path.join(projectRoot,'public','data',...parts);

export const ensureDir=async filePath=>{
  await fs.mkdir(path.dirname(filePath),{recursive:true});
};

export const readJson=async(filePath,fallback)=>{
  try{
    const text=await fs.readFile(filePath,'utf8');
    return JSON.parse(text.replace(/^\uFEFF/,''));
  }catch{
    return fallback;
  }
};

export const safeWriteJson=async(filePath,data)=>{
  await ensureDir(filePath);
  const temp=`${filePath}.tmp`;
  await fs.writeFile(temp,`${JSON.stringify(data,null,2)}\n`,'utf8');
  await fs.rename(temp,filePath);
};

export const safeWriteNonEmptyJson=async(filePath,data,items)=>{
  if(!Array.isArray(items)||items.length===0){
    throw new Error(`Refusing to overwrite ${filePath} with an empty result`);
  }
  await safeWriteJson(filePath,data);
};
