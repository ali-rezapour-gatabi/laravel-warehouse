<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @viteReactRefresh
    @routes()
    @vite(['resources/css/app.css', 'resources/ts/app.tsx'])
</head>
<body>
    <div id="react-root"></div>
</body>
</html>
