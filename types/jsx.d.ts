import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type TextElementType = '_text'
    type ElementType = 'div' | 'button'

    type Child = Element | TextElement | Stream<TextElement | Array<Element | TextElement>>

    type PlainPropsKeys = 'class' | 'id' | 'type'
    type PlainProps = Partial<Record<PlainPropsKeys, string>>
    type StreamPropsKeys = 'class$' | 'id$' | 'type$'
    type StreamProps = Partial<Record<StreamPropsKeys, Stream<string>>>

    type SpecificProps = {
      if$?: Stream<boolean>,
      key?: Key;
    }

    type ElementProps = PlainProps &  StreamProps & SpecificProps

    type Key = string | number;

    interface TextElement {
      readonly type: TextElementType,
      readonly text: string | number,
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
      h1: ElementProps;
      table: ElementProps;
      tbody: ElementProps;
      span: ElementProps;
    }
  }
}
