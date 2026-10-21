<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @if (config('app.env') === 'local')
        <script type="module">
            import RefreshRuntime from "http://{{ app()->request->getHost() }}:5173/@react-refresh";
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
        </script>
    @endif

    @vite(['resources/css/app.css', 'resources/ts/app.tsx'])
</head>
<body>
    <div id="react-root"></div>
</body>
</html>
