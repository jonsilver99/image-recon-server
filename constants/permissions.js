const permissions = {
    admin: [
        'Gallery',
        'Tiles', /*Gallery/Tiles*/ 
        'Carousel', /*Gallery/Carousel*/
        'FullPic/:name',
        'FullPic/:name/:url',
        'Upload'
    ],
    user: [
        'Gallery',
        'Tiles', /*Gallery/Tiles*/ 
        'Carousel', /*Gallery/Carousel*/
        'FullPic/:name',
        'FullPic/:name/:url'
    ]
}

module.exports = permissions;