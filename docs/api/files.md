## Structore of uploaded files

/userFiles
    /emocji
        $id.ttf # font with emojis
    /profiles
        $id.png # user profile
    /realms
        $id/
            emojis/
                $unicode.svg # indirect file to generate font, include emoji by svg file
        $id.png # realm profile
    /users
        $id/
            $file # user files