import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type TextElementType = '_text'
    type ElementType = 'div' | 'button'

    type Child = Element | TextElement | Stream<TextElement | Array<Element | TextElement>>

    interface ElementProps {
      class?: string,
      class$?: Stream<string>,
      if$?: Stream<boolean>,
      key?: Key;
    }

    type Key = string | number;

    interface TextElement {
      readonly type: TextElementType,
      readonly text: string,
      readonly key: Key;
    }

    interface Element {
      readonly type: ElementType,
      readonly props: ElementProps,
      readonly children: Child[],
      readonly key: Key;
    }

    interface IntrinsicElements {
      div: ElementProps,
      button: ElementProps;
      br: ElementProps;
    }
  }
}
