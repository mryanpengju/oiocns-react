import { uniqueArray, getAllFixedCharacter, getChartcterContent } from '../tools';
// import { FixedCharacters } from '../base/const';
//定义replaceString函数，接收3个参数：ruleStr, formData, attrs
export default function replaceString(
  ruleStr: string,
  formData: { [key: string]: any },
  attrs: { [key: string]: any },
): string {
  //将ruleStr中的特殊字符「」 提取出来，放到一个数组中，用uniqueArray去重
  const AttrSet = uniqueArray(getAllFixedCharacter(ruleStr));

  //定义一个数组用来存储缺少的属性
  const missingAttrs: string[] = [];
  //一、判断是否有限定字符FixedCharacters，替换所有限定字符为对应数据值
  // while(AttrSet.includes()){}

  //二、替换所有表单特性为对应数据值 使用reduce对AttrSet数组进行遍历和处理,
  const replacedStr = AttrSet.map((_str) => getChartcterContent(_str)).reduce(
    (ruleContent, item) => {
      //在attrs数组中查找是否有name等于item的对象
      const attrObj = attrs.find((v: { name: string }) => v.name === item);

      //如果没找到，则将item加入到missingAttrs数组中，返回ruleContent
      if (!attrObj) {
        missingAttrs.push(item!);
        return ruleContent;
      }

      //如果找到了，从formData中获取该属性的值
      const attrValue = formData?.[attrObj.id];

      //如果有值，则使用属性值替换掉规则字符串中的「item」，返回替换后的结果
      if (attrValue && ruleContent) {
        return ruleContent.replaceAll(`「${item}」`, attrValue);
      } else {
        //如果没有值，将item加入到missingAttrs数组中，返回ruleContent
        missingAttrs.push(item!);
        return ruleContent;
      }
    },
    ruleStr,
  );

  //如果missingAttrs数组中有缺少的属性，打印错误信息并返回空字符串
  if (missingAttrs.length > 0) {
    console.error(
      `公式处理失败：${missingAttrs.map((item) => `${item}数据缺失`).join('、')}`,
    );
    return '';
  }

  //如果没有缺少的属性，返回替换后的字符串
  return replacedStr ?? '';
}