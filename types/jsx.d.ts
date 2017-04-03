import { Stream } from 'xstream'
type DOMElement = Element;

declare global {
  namespace JSX {
    type ElementType = string
    type Children = string | Element | Stream<string> | Array<string | Element | Stream<string>>

    interface ElementProps {
      class?: string,
      visible$?: Stream<boolean>,
    }

    interface Element {
      type: ElementType,
      className?: string,
      children: Children,
      node?: DOMElement,
      visible$?: Stream<boolean>,
    }

    interface IntrinsicElements {
      div: any,
      button: any,
    }
  }
}
