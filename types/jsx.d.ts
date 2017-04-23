import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type TextElementType = '_text'
    type ElementType = 'div' | 'button'

    type Child = Collection<any> | Element | TextElement | Stream<TextElement>

    type PlainPropsKeys = 'class' | 'id' | 'type' | 'href'
    type PlainProps = Partial<Record<PlainPropsKeys, string>>
    type StreamPropsKeys = 'class$' | 'id$' | 'type$' | 'href$'
    type StreamProps = Partial<Record<StreamPropsKeys, Stream<string>>>

    type SpecificProps = {
      if$?: Stream<boolean>,
      key?: Key;
    }

    type ElementProps = PlainProps &  StreamProps & SpecificProps

    type Key = string | number;

    interface TextElement {
      readonly type: TextElementType,
      readonly text: string,
    }

    interface Element {
      readonly type: ElementType,
      readonly props: ElementProps,
      readonly children: Child[],
    }

    interface CollectionProps {
      items$: Stream<any[]>
      trackBy: (item: any) => Key;
    }

    type CollectionItemGetter<Item> = (item$: Stream<Item>) => Child

    interface Collection<Item> {
      readonly type: 'collection',
      readonly items$: Stream<Item[]>
      readonly trackBy: (item: Item) => Key;
      readonly getItem: CollectionItemGetter<Item>;
    }

    interface IntrinsicElements {
      div: ElementProps,
      button: ElementProps;
      br: ElementProps;
      h1: ElementProps;
      table: ElementProps;
      tbody: ElementProps;
      tr: ElementProps;
      td: ElementProps;
      a: ElementProps;
      span: ElementProps;
      ul: ElementProps;
      li: ElementProps;
      p: ElementProps;

      collection: CollectionProps;
    }
  }
}
