// Runs inside the Playwright Docker container, before the visual tests.
// The shop's dev server only accepts requests addressed to "localhost", and the shop's own code
// calls its API at localhost:8091. Inside a container, "localhost" is the container itself, so this
// forwards the container's localhost ports to the Mac (host.docker.internal). The browser can then
// open http://localhost:4200 exactly as on the Mac, and the pages load their API data too.
import net from 'node:net';

const target = process.env.FORWARD_HOST || 'host.docker.internal';
const ports = (process.env.FORWARD_PORTS || '4200,8091').split(',').map(Number);

for (const port of ports) {
  // Bind both loopback addresses: browsers and Node may resolve "localhost" to either.
  for (const address of ['127.0.0.1', '::1']) {
    const server = net.createServer((client) => {
      const upstream = net.connect(port, target);
      client.pipe(upstream).pipe(client);
      const close = () => {
        client.destroy();
        upstream.destroy();
      };
      client.on('error', close);
      upstream.on('error', close);
    });
    server.on('error', (error) => {
      // IPv6 may be unavailable in the container; IPv4 alone is enough then.
      if (address !== '::1') throw error;
    });
    server.listen(port, address, () =>
      console.log(`forwarding ${address}:${port} -> ${target}:${port}`),
    );
  }
}
