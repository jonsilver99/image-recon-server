const permissions = {
    admin: [
        'Gallery',
        'Tiles', /*Gallery/Tiles*/ 
        'Carousel', /*Gallery/Carousel*/
        'FullPic/:name',
        'Upload'
    ],
    user: [
        'Gallery',
        'Tiles', /*Gallery/Tiles*/ 
        'Carousel', /*Gallery/Carousel*/
        'FullPic/:name'
    ]
}

module.exports = permissions;