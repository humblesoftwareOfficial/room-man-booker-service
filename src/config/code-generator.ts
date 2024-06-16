/* eslint-disable prettier/prettier */
const generateCode = (length: number) => {
  const CHARACTERS =
    'AZERTYUIOPQSDFGHJKLMWXCVBNazertyuiopqsdfghjklmwxcvbn1234567890';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
};

export const codeGenerator = (prefix: string) =>
  `${prefix}-${Date.now().toString()}-${generateCode(5)}`;

export const generateDefaultPassword = () => generateCode(6);

export const hasValue = (value: any) => value !== null && value !== undefined;