import 'react';
import 'react-dom';

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element extends React.ReactElement { }
     
    interface ElementClass extends React.Component {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty { props: Record<string, unknown> }
    interface ElementChildrenAttribute { children: Record<string, unknown> }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicAttributes extends React.Attributes { }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> { }
  }
}

// Global type declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
