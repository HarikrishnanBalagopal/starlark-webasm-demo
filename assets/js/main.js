import './wasm_exec.js';

const INITIAL_STARLARK_CODE = `# Starlark is very close to Python

def get_circle(radius):
  N = radius+2
  circle = ''
  for y in range(-N, N):
    for _x in range(-2*N, 2*N):
      x = _x/2
      circle += '*' if x*x+y*y<=radius*radius else ' '
    circle += '\\n'
  return circle

def main():
  print("Hello World! 😃")
  print([x for x in range(10) if x % 2 == 0])
  circle = get_circle(8)
  print(circle)
`;

async function main() {
    const resp = await fetch('assets/wasm/main.wasm', { headers: { 'Accept': 'application/wasm' } });
    if (!resp.ok) return console.error('failed to fetch the starlark web assembly module. status:', resp.statusText);
    const moduleBytes = await resp.arrayBuffer();
    const go = new Go();
    const module = await WebAssembly.instantiate(moduleBytes, go.importObject);
    go.run(module.instance);

    const starlark_input = document.querySelector('#starlark-input');
    starlark_input.value = INITIAL_STARLARK_CODE;
    const starlark_output = document.querySelector('#starlark-output');
    const button_run = document.querySelector('#button-run');
    button_run.addEventListener('click', () => {
        const starlark_code = starlark_input.value;
        const result = run_starlark_code(starlark_code);
        if (result.error) return console.error(result.error);
        console.log(result.message);
        starlark_output.value = result.message;
    });
}

main();
