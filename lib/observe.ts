/**
 * One shared IntersectionObserver per margin, so hundreds of tiles/images can
 * watch visibility without hundreds of observers.
 */
type Callback = (visible: boolean) => void;

const observers = new Map<string, { io: IntersectionObserver; subs: Map<Element, Callback> }>();

export function observe(el: Element, cb: Callback, rootMargin = "200px") {
  let entry = observers.get(rootMargin);

  if (!entry) {
    const subs = new Map<Element, Callback>();
    const io = new IntersectionObserver(
      (records) => records.forEach((r) => subs.get(r.target)?.(r.isIntersecting)),
      { rootMargin },
    );

    entry = { io, subs };
    observers.set(rootMargin, entry);
  }

  entry.subs.set(el, cb);
  entry.io.observe(el);

  return () => {
    entry!.subs.delete(el);
    entry!.io.unobserve(el);
  };
}
