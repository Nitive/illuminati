import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type TextElementType = '_text'
    type ElementType = 'div' | 'button'

    type Child = Element | TextElement // | Stream<TextElement>

    interface ElementProps {
      class?: string,
      class$?: Stream<string>,
      if$?: Stream<boolean>,
    }

    interface TextElement {
      readonly type: TextElementType,
      readonly text: string,
    }

    interface Element {
      readonly type: ElementType,
      readonly props: ElementProps,
      readonly children: Child[],
    }

    interface IntrinsicElements {
      div: ElementProps,
      button: ElementProps;
    }
  }
}
