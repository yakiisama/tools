'use client';

import Image from 'next/image';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { getSong } from '../api/ktv';
import CircleSvg from '@/public/circle.svg';
import LineSvg from '@/public/line.svg';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Button, Description, Input, Label } from '@headlessui/react';
import { Field } from '@headlessui/react';

export default function Song() {
  const [value, setValue] = useState('');
  const handleClick = async () => {
    if (!value) {
      toast.error('请输入链接');
      return;
    }
    if (!value.includes('http')) {
      toast.error('请输入正确的链接');
      return;
    }
    toast.promise(getSong(value), {
      loading: '下载中，别急，坐和放宽...',
      success: (data) => {
        if (data?.url) {
          saveAs(data.url, `${data.songName}.mp3`);
        }
        return '下载成功';
      },
      error: 'Error',
    });

  };
  return (
    <div className="text-lg">
      <div>
        <div className="block lg:gap-10 lg:flex">
          <div>
            <div>1. 打开全民 k 歌对应的歌曲页面</div>
            <div>
              2. 点击右上角的
              <b className="relative">
                <span>三个点</span>
                <div className="w-[80px] absolute -right-4 -top-5">
                  <CircleSvg />
                </div>
              </b>
            </div>
            <div>
              3. 点击
              <b className="relative">
                <span>分享</span>
                <div className="absolute w-[50px] -right-1 -bottom-1">
                  <LineSvg />
                </div>
              </b>
            </div>
            <div>
              4. 选择
              <b className="relative">
                <span>复制链接</span>
                <div className="absolute w-[90px] -right-2 -bottom-2">
                  <LineSvg />
                </div>
              </b>
            </div>
            <div>5. 粘贴至下面的输入框中</div>
            <div>6. 点击下载</div>
          </div>
          <div>
            <div>Example: </div>
            <div className="w-40">
              <Image
                src="/song.jpg"
                alt="example-song.jpg"
                width={200}
                height={400}
                priority
              />
            </div>
          </div>
        </div>
        <div className="my-8 break-all">
          从这里复制出来链接，然后粘贴到下面的框框去
        </div>
        <div className="w-[800px]">
          <div className="w-full max-w-md rounded-lg">
            <Field>
              <Label className="text-sm/6 font-medium text-[#0f0e17]">
                链接地址URL
              </Label>
              <Description className="text-sm/6 text-[#0f0e17]/50">
                这里粘贴你的全民 k 歌链接
              </Description>
              <Input
                className={clsx(
                  'mt-3 block w-full rounded-lg border border-[#0f0e17] py-1.5 px-3 text-sm/6 text-[#0f0e17]',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                )}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <Button
          className="mt-5 px-5 py-1  rounded-md  focus:outline-none focus:ring-2 bg-[#f25f4c] text-white data-[active]:#fff"
          onClick={handleClick}
        >
          下载
        </Button>
      </div>
    </div>
  );
}
