import styled from "styled-components";
import {Checkbox} from "antd";

const StyledCheckBox = styled(Checkbox)`
  &.ant-checkbox-wrapper {
    width: 25px;
    height: 25px;

    justify-content: center;
    align-items: center;

    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }

  &.ant-checkbox-wrapper-checked {
    background-color: #1890ff;
    color: #fff;
  }

  .ant-checkbox {
    display: none;
  }

  
`;

export default StyledCheckBox;