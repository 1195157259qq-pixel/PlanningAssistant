import React, { useState } from 'react'
import { useStore } from '../store'

const PROVINCES: Record<string, string[]> = {
  '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'],
  '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '浦东新区'],
  '广东': ['广州市', '深圳市', '珠海市', '东莞市', '佛山市', '惠州市'],
  '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'],
  '江苏': ['南京市', '苏州市', '无锡市', '常州市', '南通市', '徐州市'],
  '四川': ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市', '泸州市'],
  '湖北': ['武汉市', '宜昌市', '襄阳市', '荆州市', '十堰市', '黄石市'],
  '山东': ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市', '淄博市'],
  '福建': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市', '龙岩市'],
  '河南': ['郑州市', '洛阳市', '开封市', '南阳市', '新乡市', '商丘市'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市', '常德市'],
  '河北': ['石家庄市', '唐山市', '保定市', '邯郸市', '廊坊市', '沧州市'],
  '陕西': ['西安市', '咸阳市', '宝鸡市', '渭南市', '延安市', '汉中市'],
  '安徽': ['合肥市', '芜湖市', '蚌埠市', '马鞍山市', '安庆市', '淮南市'],
  '辽宁': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '锦州市'],
  '重庆': ['渝中区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '渝北区'],
  '天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '滨海新区'],
  '江西': ['南昌市', '九江市', '赣州市', '景德镇市', '萍乡市', '上饶市'],
  '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '玉林市'],
  '云南': ['昆明市', '曲靖市', '玉溪市', '大理市', '丽江市', '保山市'],
}

const PROVINCE_LIST = Object.keys(PROVINCES)

export default function Settings({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed || state.categories.includes(trimmed)) return
    dispatch({ type: 'UPDATE_CATEGORIES', payload: [...state.categories, trimmed].sort() })
    setNewCategory('')
  }

  const handleRemoveCategory = (cat: string) => {
    dispatch({ type: 'UPDATE_CATEGORIES', payload: state.categories.filter(c => c !== cat) })
  }

  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { className: 'modal', onClick: (e: React.MouseEvent) => e.stopPropagation() },
      React.createElement('div', { className: 'modal-title' }, '设置'),
      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { className: 'form-label' }, '分类管理'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
          React.createElement('input', {
            className: 'form-input',
            type: 'text',
            value: newCategory,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value),
            onKeyDown: (e: React.KeyboardEvent) => e.key === 'Enter' && handleAddCategory(),
            placeholder: '输入新分类名称',
          }),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: handleAddCategory,
            disabled: !newCategory.trim(),
          }, '添加'),
        ),
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          ...state.categories.map(cat =>
            React.createElement('span', {
              key: cat,
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                background: '#eef2ff',
                color: '#4f46e5',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
              },
            },
              cat,
              React.createElement('button', {
                onClick: () => handleRemoveCategory(cat),
                style: {
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#4f46e5',
                  fontSize: 14,
                  padding: 0,
                  lineHeight: 1,
                },
              }, '\u2715'),
            ),
          ),
          state.categories.length === 0 && React.createElement('span', { style: { fontSize: 12, color: 'var(--text-secondary)' } }, '暂无分类'),
        ),
      ),
      React.createElement('div', { style: { marginBottom: 20 } },
        React.createElement('label', { className: 'form-label' }, '关于'),
        React.createElement('div', { style: { fontSize: 13, color: 'var(--text-secondary)' } },
          '计划助手 v1.0 - 帮助你高效管理日程和任务',
        ),
      ),
      React.createElement('div', { className: 'form-actions' },
        React.createElement('button', { className: 'btn btn-primary', onClick: onClose }, '关闭'),
      ),
    ),
  )
}

export { PROVINCES, PROVINCE_LIST }
