import { xCreateElement, xFragment } from "src/lib/rezact/rezact";

export function Page() {
  return (
    <>
      <h1>Hello World</h1>
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
      <Button />
    </>
  );
}

function Button() {
  let $count = 0;

  return (
    <button onClick={() => $count++}>
      Clicked {$count} {$count === 1 ? "time" : "times"}
    </button>
  );
}