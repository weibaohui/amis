import {ExpressionComplex, Field, Funcs, Func, ExpressionFunc} from './types';
import React from 'react';
import ConditionField from './Field';
import {autobind, findTree} from '../../utils/helper';
import Value from './Value';
import InputSwitch from './InputSwitch';
import ConditionFunc from './Func';
import {ThemeProps, themeable} from '../../theme';

/**
 * 支持4中表达式设置方式
 *
 * 1. 直接就是值，由用户直接填写。
 * 2. 选择字段，让用户选一个字段。
 * 3. 选择一个函数，然后会参数里面的输入情况是个递归。
 * 4. 粗暴点，函数让用户自己书写。
 */

export interface ExpressionProps extends ThemeProps {
  value: ExpressionComplex;
  index?: number;
  onChange: (value: ExpressionComplex, index?: number) => void;
  valueField?: Field;
  fields?: Field[];
  funcs?: Funcs;
  defaultType?: 'value' | 'field' | 'func' | 'raw';
  allowedTypes?: Array<'value' | 'field' | 'func' | 'raw'>;
}

const fieldMap = {
  value: '值',
  field: '字段',
  func: '函数',
  raw: '公式'
};

export class Expression extends React.Component<ExpressionProps> {
  @autobind
  handleInputTypeChange(type: 'value' | 'field' | 'func' | 'raw') {
    let value = this.props.value;
    const onChange = this.props.onChange;

    if (type === 'value') {
      value = '';
    } else if (type === 'func') {
      value = {
        type: 'func',
        func: (findTree(this.props.funcs!, item => (item as Func).type) as Func)
          ?.type,
        args: []
      };
    } else if (type === 'field') {
      value = {
        type: 'field',
        field: ''
      };
    } else if (type === 'raw') {
      value = {
        type: 'raw',
        value: ''
      };
    }
    onChange(value, this.props.index);
  }

  @autobind
  handleValueChange(data: any) {
    this.props.onChange(data, this.props.index);
  }

  @autobind
  handleFieldChange(field: string) {
    let value = this.props.value;
    const onChange = this.props.onChange;
    value = {
      type: 'field',
      field
    };
    onChange(value, this.props.index);
  }

  @autobind
  handleFuncChange(func: any) {
    let value = this.props.value;
    const onChange = this.props.onChange;
    value = {
      ...func,
      type: 'func'
    };
    onChange(value, this.props.index);
  }

  @autobind
  handleRawChange() {}

  render() {
    const {value, defaultType, allowedTypes, funcs, fields} = this.props;
    const inputType =
      ((value as any)?.type === 'field'
        ? 'field'
        : (value as any)?.type === 'func'
        ? 'func'
        : (value as any)?.type === 'raw'
        ? 'raw'
        : value !== undefined
        ? 'value'
        : undefined) ||
      defaultType ||
      allowedTypes?.[0] ||
      'value';

    const types = allowedTypes || ['value', 'field', 'func'];

    if ((!Array.isArray(funcs) || !funcs.length) && ~types.indexOf('func')) {
      types.splice(types.indexOf('func'), 1);
    }

    return (
      <>
        {types.length > 1 ? (
          <InputSwitch
            value={inputType}
            onChange={this.handleInputTypeChange}
            options={types.map(item => ({
              label: fieldMap[item],
              value: item
            }))}
          />
        ) : null}

        {inputType === 'value' ? <Value /> : null}

        {inputType === 'field' ? (
          <ConditionField
            value={(value as any)?.field}
            onChange={this.handleFieldChange}
            options={fields!}
          />
        ) : null}

        {inputType === 'func' ? (
          <ConditionFunc
            value={value as ExpressionFunc}
            onChange={this.handleFuncChange}
            funcs={funcs}
            fields={fields}
            defaultType={defaultType}
            allowedTypes={allowedTypes}
          />
        ) : null}
      </>
    );
  }
}

export default themeable(Expression);