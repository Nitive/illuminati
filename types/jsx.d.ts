import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type TextElementType = '_text'
    type ElementType = 'div' | 'button'

    type Child = Element | TextElement // | Stream<TextElement>

    interface StaticProps {
      readonly class?: string,
    }

    interface DynamicProps {
      readonly if$?: Stream<boolean>,
    }

    type ElementProps = StaticProps & DynamicProps

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
