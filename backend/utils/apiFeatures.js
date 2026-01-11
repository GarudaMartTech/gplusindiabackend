class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // search(){
  //   const {keyword} = this.queryStr;
  //   if(keyword){
  //     const regex = new RegExp(keyword,'i')
  //     this.query = this.query.find({
  //       name: {$regex: regex}
  //     })
  //   }
  //   return this
  // }

  // search() {
  //     const keyword = this.queryStr.keyword
  //     ? {
  //         name: {
  //           $regex: this.queryStr.keyword,
  //           $options: "i",
  //         },
  //       }
  //     : {};
  //   this.query = this.query.find({ ...keyword });
  //   return this;
  // }

  search() {
    const { keyword, category, description, brand } = this.queryStr;
    let searchQuery = {};

    let searchItem = keyword
      .replace(/\s{2,}/g, " ")
      .replace(/\s+$/, "")
      .trim();
    let regexValue = /\b\w{2,10}\b/g;

    let matchedKeywords = searchItem.match(regexValue) || [];
    searchItem = matchedKeywords.join(" ");

    if (searchItem) {
      const regex = new RegExp(searchItem, "i");
      searchQuery = {
        $or: [
          { name: { $regex: regex } },
          { description: { $regex: regex } },
          // Add additional fields here as needed
        ],
      };
    }

    if (category) {
      searchQuery.category = category;
    }

    if (description) {
      const regex = new RegExp(description, "i");
      searchQuery.description = { $regex: regex };
    }

    if (brand) {
      searchQuery.brand = brand;
    }

    // Apply search query to the base query
    this.query = this.query.find(searchQuery);

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFileds = ["keyword", "page", "limit"];

    removeFileds.forEach((key) => delete queryCopy[key]);

    // if(queryCopy.category){
    //   this.query = this.query.populate({
    //     path: 'category',
    //     match:{slug: queryCopy.category},
    //     select: 'name'
    //   })
    //   delete queryCopy.category;
    // }

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
