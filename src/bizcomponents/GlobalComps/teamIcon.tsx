import React, { useState } from 'react';
import { TargetType } from '@/ts/core';
import * as im from 'react-icons/im';
import { TargetShare } from '@/ts/base/model';
import { Avatar, Image } from 'antd';

interface teamTypeInfo {
  preview?: boolean;
  size?: number;
  fontSize?: number;
  share: TargetShare;
<<<<<<< HEAD
  onlySvg?: boolean;
=======
  notAvatar?: boolean;
>>>>>>> main
}

/** 组织图标 */
const TeamIcon = (info: teamTypeInfo) => {
  const [preview, setPreview] = useState(false);
  const size = info.size ?? 22;
  const fontSize = info.fontSize ?? 18;
  if (info.share.avatar && info.share.avatar.thumbnail) {
    return (
      <div style={{ cursor: 'pointer', display: 'inline-block' }} title="点击预览">
        {info.preview && (
          <Image
            style={{ display: 'none' }}
            preview={{
              visible: preview,
              src: info.share.avatar.shareLink,
              onVisibleChange: (value) => {
                setPreview(value);
              },
            }}
          />
        )}
        <Avatar
          size={size}
          src={info.share.avatar.thumbnail}
          onClick={() => {
            setPreview(true);
          }}
        />
      </div>
    );
  }
  let icon;
  switch (info.share.typeName) {
    case '平台':
    case TargetType.Group:
      icon = <im.ImTree fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Company:
      icon = <im.ImOffice fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Section:
    case TargetType.Department:
      return <im.ImLibrary fontSize={size ? size - 4 : fontSize} />;
    case TargetType.College:
      return <im.ImTrophy fontSize={size ? size - 4 : fontSize} />;
    case TargetType.Laboratory:
      icon = <im.ImJoomla fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Office:
      icon = <im.ImBriefcase fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Research:
      icon = <im.ImFlickr4 fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Working:
      icon = <im.ImUsers fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Station:
      icon = <im.ImAddressBook fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Cohort:
      icon = <im.ImBubbles fontSize={size ? size - 4 : fontSize} />;
      break;
    case TargetType.Person:
      icon = <im.ImUserTie fontSize={size ? size - 4 : fontSize} />;
      break;
    default:
      icon = <im.ImSvg fontSize={size ? size - 4 : fontSize} />;
      break;
  }
<<<<<<< HEAD
  console.log(size);
  return info.onlySvg ? (
    icon
  ) : (
=======
  if (info.notAvatar) {
    return icon;
  }
  return (
>>>>>>> main
    <Avatar
      size={size}
      icon={icon}
      style={{ background: 'transparent', color: '#a6aec7' }}
    />
  );
};

export default TeamIcon;
