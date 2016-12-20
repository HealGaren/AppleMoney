/**
 * Created by 최예찬 on 2016-12-20.
 */

"use strict";

var jsonfile = require('jsonfile');
jsonfile.spaces = 4;

const dataFile = './joosik/data.json';
const extraFile = './joosik/extra.json';

var priceData = [];
var joosikExtra = [];

const startDay = 21;
const startHour = 12;
const joosikNumMap = {
    "단절통신":0,
    "사망생명":1,
    "석기전자":2,
    "지진건설":3,
    "파산은행":4
};

exports.reloadData = function(){
    console.log(dataFile + ' 파일 읽는 중...');
    let priceInfos = jsonfile.readFileSync(dataFile);
    console.log(dataFile + ' 파일을 모두 읽었습니다. 처리 중..');
    for(let name in priceInfos){
        let priceInfo = priceInfos[name];
        let dataPair = [];
        let currentMoney = 2000;
        for(let i=0; i<2; i++){
            let oneData = [{
                price:currentMoney,
                delta:0
            }];
            for(let info of priceInfo[i]){
                currentMoney += info;
                oneData.push({
                    price:currentMoney,
                    delta:info
                });
            }
            dataPair[i] = oneData;
        }

        var joosikNum = joosikNumMap[name];
        priceData[joosikNum] = dataPair;
    }
    console.log(dataFile + ' 파일 적용 완료.');
    console.log(extraFile + ' 파일 읽는 중...');
    joosikExtra = jsonfile.readFileSync(extraFile);
    console.log(dataFile + ' 파일을 모두 읽고 적용했습니다.');
};

exports.reloadData();

exports.getPriceAndDelta = function(joosikNum){
    let d = new Date();
    let dayIndex = d.getDate() - startDay;
    if(dayIndex < 0) dayIndex = 0;
    if(dayIndex > 1) dayIndex = 1;

    let timeIndex = d.getHours() - startHour;
    if(timeIndex < 0) timeIndex = 0;
    else if(timeIndex > 8) timeIndex = 8;
    return priceData[joosikNum][dayIndex][timeIndex];
};
exports.getAllPriceAndDelta = function(){
    let d = new Date();
    let dayIndex = d.getDate() - startDay;
    if(dayIndex < 0) dayIndex = 0;
    if(dayIndex > 1) dayIndex = 1;

    let timeIndex = d.getHours() - startHour;
    if(timeIndex < 0) timeIndex = 0;
    else if(timeIndex > 8) timeIndex = 8;

    let result = [];
    for(let pricePair of priceData){
        result.push(pricePair[dayIndex][timeIndex]);
    }
    return result;
};

exports.getExtra = function(joosikNum){
    return joosikExtra[joosikNum];
};
exports.getAllExtra = function(){
    let result = [];
    for(let extra of joosikExtra){
        result.push(extra);
    }
    return result;
};


exports.addExtra = function(joosikNum, size){
    joosikExtra[joosikNum] += size;
    console.log('주식 ' + joosikNum + '의 거래 ' + size + '주 완료. 파일 쓰기 중...');
    jsonfile.writeFileSync('./joosik/extra.json', joosikExtra);
    console.log('파일 쓰기 완료');
};