// Mock styled-components for Jest tests
import * as React from 'react';

const styled = (tag: string) => () => {
  const StyledComponent = React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      return React.createElement(tag, { ...props, ref });
    }
  );
  StyledComponent.displayName = `Styled(${tag})`;
  return StyledComponent;
};

// Add common HTML elements
styled.div = styled('div');
styled.span = styled('span');
styled.button = styled('button');
styled.input = styled('input');
styled.form = styled('form');
styled.h1 = styled('h1');
styled.h2 = styled('h2');
styled.h3 = styled('h3');
styled.p = styled('p');
styled.a = styled('a');
styled.img = styled('img');
styled.section = styled('section');
styled.header = styled('header');
styled.footer = styled('footer');
styled.nav = styled('nav');
styled.main = styled('main');
styled.aside = styled('aside');
styled.article = styled('article');

export default styled;
export { styled };

// Mock other styled-components exports
export const css = (strings: TemplateStringsArray) => strings.join('');
export const keyframes = (strings: TemplateStringsArray) => strings.join('');
export const createGlobalStyle = () => () => null;
export const ThemeProvider = ({ children }: { children: React.ReactNode }) =>
  children;
